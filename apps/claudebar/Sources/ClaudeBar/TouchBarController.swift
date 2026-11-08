import AppKit

/// Posa la nostra barra a sobre de tot i un botonet amb la mascota a la Control Strip.
final class TouchBarController: NSObject, NSTouchBarDelegate {
    static let trayId = NSTouchBarItem.Identifier("local.claudebar.tray")
    static let mascotId = NSTouchBarItem.Identifier("local.claudebar.mascot")

    let mascotView: MascotBarView
    private var trayItem: NSCustomTouchBarItem?
    private(set) var isPresented = false

    private enum Keys {
        static let hideControlStrip = "hideControlStrip"
        static let alwaysOnTop = "alwaysOnTop"
    }

    /// Amaga volum/brillantor i ocupa tota la barra.
    var hideControlStrip: Bool {
        get { UserDefaults.standard.bool(forKey: Keys.hideControlStrip) }
        set { UserDefaults.standard.set(newValue, forKey: Keys.hideControlStrip); if isPresented { present() } }
    }

    /// Torna a posar-se a sobre cada cop que canvies d'app. Si ho apagues,
    /// la de l'app activa guanya i tu toques la mascota de la Control Strip per tornar-la a veure.
    var alwaysOnTop: Bool {
        get { UserDefaults.standard.object(forKey: Keys.alwaysOnTop) as? Bool ?? true }
        set { UserDefaults.standard.set(newValue, forKey: Keys.alwaysOnTop) }
    }

    private lazy var touchBar: NSTouchBar = {
        let bar = NSTouchBar()
        bar.delegate = self
        bar.defaultItemIdentifiers = [Self.mascotId]
        return bar
    }()

    init(mascotView: MascotBarView) {
        self.mascotView = mascotView
        super.init()
    }

    func setup() {
        guard PrivateTouchBar.isAvailable else {
            NSLog("ClaudeBar: aquest macOS no exposa l'API de Touch Bar system modal")
            return
        }
        let tray = NSCustomTouchBarItem(identifier: Self.trayId)
        let button = NSButton(image: Sprite.icon(pixel: 1.5), target: self, action: #selector(trayTapped))
        button.bezelColor = .clear
        tray.view = button
        trayItem = tray

        PrivateTouchBar.addSystemTrayItem(tray)
        PrivateTouchBar.setControlStripPresence(Self.trayId, true)
        PrivateTouchBar.showsCloseBoxWhenFrontMost(false)
        present()

        NSWorkspace.shared.notificationCenter.addObserver(
            self, selector: #selector(appActivated(_:)),
            name: NSWorkspace.didActivateApplicationNotification, object: nil
        )
    }

    func teardown() {
        NSWorkspace.shared.notificationCenter.removeObserver(self)
        PrivateTouchBar.dismiss(touchBar)
        if let trayItem {
            PrivateTouchBar.setControlStripPresence(Self.trayId, false)
            PrivateTouchBar.removeSystemTrayItem(trayItem)
        }
        isPresented = false
    }

    func present() {
        PrivateTouchBar.present(touchBar, trayId: Self.trayId, hideControlStrip: hideControlStrip)
        isPresented = true
    }

    func minimize() {
        PrivateTouchBar.minimize(touchBar)
        isPresented = false
    }

    @objc private func trayTapped() {
        isPresented ? minimize() : present()
    }

    @objc private func appActivated(_ note: Notification) {
        guard alwaysOnTop, isPresented else { return }
        // L'app nova posa la seva barra; ens hi tornem a posar a sobre un moment després.
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
            guard let self, self.isPresented else { return }
            self.present()
        }
    }

    // MARK: - NSTouchBarDelegate

    func touchBar(_ touchBar: NSTouchBar, makeItemForIdentifier identifier: NSTouchBarItem.Identifier) -> NSTouchBarItem? {
        guard identifier == Self.mascotId else { return nil }
        let item = NSCustomTouchBarItem(identifier: identifier)
        mascotView.translatesAutoresizingMaskIntoConstraints = false
        mascotView.widthAnchor.constraint(equalToConstant: MascotBarView.barWidth).isActive = true
        item.view = mascotView
        return item
    }
}
