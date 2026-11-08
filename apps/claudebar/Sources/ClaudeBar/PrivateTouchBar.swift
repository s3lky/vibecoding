import AppKit

/// API PRIVADA de macOS (DFRFoundation + mètodes ocults de NSTouchBar).
/// És el que fan servir MTMR, Pock o les apps del gat de la Touch Bar per quedar-se
/// sempre visibles. No està documentada: es pot trencar amb una actualització de macOS
/// i l'App Store la rebutja. Per a ús personal, funciona.
///
/// Ho resolem tot en temps d'execució (dlsym + runtime d'Objective-C) perquè així no cal
/// enllaçar contra el framework privat ni tenir bridging header: si algun símbol no hi és,
/// simplement no fa res en lloc de petar en arrencar.
enum PrivateTouchBar {
    private static let dfr: UnsafeMutableRawPointer? = dlopen(
        "/System/Library/PrivateFrameworks/DFRFoundation.framework/DFRFoundation", RTLD_NOW
    )

    private static func symbol(_ name: String) -> UnsafeMutableRawPointer? {
        guard let dfr else { return nil }
        return dlsym(dfr, name)
    }

    /// DFRElementSetControlStripPresenceForIdentifier(NSString *, BOOL)
    static func setControlStripPresence(_ id: NSTouchBarItem.Identifier, _ visible: Bool) {
        typealias Fn = @convention(c) (NSString, Bool) -> Void
        guard let s = symbol("DFRElementSetControlStripPresenceForIdentifier") else { return }
        unsafeBitCast(s, to: Fn.self)(id.rawValue as NSString, visible)
    }

    /// DFRSystemModalShowsCloseBoxWhenFrontMost(BOOL)
    static func showsCloseBoxWhenFrontMost(_ show: Bool) {
        typealias Fn = @convention(c) (Bool) -> Void
        guard let s = symbol("DFRSystemModalShowsCloseBoxWhenFrontMost") else { return }
        unsafeBitCast(s, to: Fn.self)(show)
    }

    // MARK: - Mètodes de classe ocults

    private static func classMethod(_ cls: AnyClass, _ name: String) -> (imp: IMP, sel: Selector)? {
        let sel = NSSelectorFromString(name)
        guard let m = class_getClassMethod(cls, sel) else { return nil }
        return (imp: method_getImplementation(m), sel: sel)
    }

    /// +[NSTouchBarItem addSystemTrayItem:]
    static func addSystemTrayItem(_ item: NSTouchBarItem) {
        typealias Fn = @convention(c) (AnyClass, Selector, NSTouchBarItem) -> Void
        guard let m = classMethod(NSTouchBarItem.self, "addSystemTrayItem:") else { return }
        unsafeBitCast(m.imp, to: Fn.self)(NSTouchBarItem.self, m.sel, item)
    }

    /// +[NSTouchBarItem removeSystemTrayItem:]
    static func removeSystemTrayItem(_ item: NSTouchBarItem) {
        typealias Fn = @convention(c) (AnyClass, Selector, NSTouchBarItem) -> Void
        guard let m = classMethod(NSTouchBarItem.self, "removeSystemTrayItem:") else { return }
        unsafeBitCast(m.imp, to: Fn.self)(NSTouchBarItem.self, m.sel, item)
    }

    /// Presenta la barra com a "system modal": es queda a sobre de la de qualsevol app.
    /// hideControlStrip = true ocupa tota la barra (amaga volum, brillantor...).
    static func present(_ bar: NSTouchBar, trayId: NSTouchBarItem.Identifier, hideControlStrip: Bool) {
        let id = trayId.rawValue as NSString
        if hideControlStrip,
           let m = classMethod(NSTouchBar.self, "presentSystemModalTouchBar:placement:systemTrayItemIdentifier:") {
            typealias Fn = @convention(c) (AnyClass, Selector, NSTouchBar, Int64, NSString) -> Void
            unsafeBitCast(m.imp, to: Fn.self)(NSTouchBar.self, m.sel, bar, 1, id)
        } else if let m = classMethod(NSTouchBar.self, "presentSystemModalTouchBar:systemTrayItemIdentifier:") {
            typealias Fn = @convention(c) (AnyClass, Selector, NSTouchBar, NSString) -> Void
            unsafeBitCast(m.imp, to: Fn.self)(NSTouchBar.self, m.sel, bar, id)
        }
    }

    /// Minimitza la barra: torna a sortir la de l'app activa i ens quedem a la Control Strip.
    static func minimize(_ bar: NSTouchBar) {
        typealias Fn = @convention(c) (AnyClass, Selector, NSTouchBar) -> Void
        guard let m = classMethod(NSTouchBar.self, "minimizeSystemModalTouchBar:") else { return }
        unsafeBitCast(m.imp, to: Fn.self)(NSTouchBar.self, m.sel, bar)
    }

    static func dismiss(_ bar: NSTouchBar) {
        typealias Fn = @convention(c) (AnyClass, Selector, NSTouchBar) -> Void
        guard let m = classMethod(NSTouchBar.self, "dismissSystemModalTouchBar:") else { return }
        unsafeBitCast(m.imp, to: Fn.self)(NSTouchBar.self, m.sel, bar)
    }

    static var isAvailable: Bool {
        classMethod(NSTouchBar.self, "presentSystemModalTouchBar:systemTrayItemIdentifier:") != nil
    }
}
