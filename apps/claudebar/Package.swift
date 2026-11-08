// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "ClaudeBar",
    platforms: [.macOS(.v13)],
    targets: [
        // Lògica pura (Foundation): preus, lectura de logs, estat de sessions, hooks.
        .target(name: "ClaudeBarCore"),
        // App de la Touch Bar (AppKit + API privada DFRFoundation).
        .executableTarget(name: "ClaudeBar", dependencies: ["ClaudeBarCore"]),
        .testTarget(name: "ClaudeBarCoreTests", dependencies: ["ClaudeBarCore"]),
    ]
)
