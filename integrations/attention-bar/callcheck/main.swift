// Prints "camera", "mic", or nothing: whether any app is using a camera or microphone right now.
import CoreAudio
import CoreMediaIO

func running(_ obj: UInt32, _ sel: UInt32, cmio: Bool) -> Bool {
    var v: UInt32 = 0; var size = UInt32(MemoryLayout<UInt32>.size)
    if cmio {
        var a = CMIOObjectPropertyAddress(mSelector: sel, mScope: CMIOObjectPropertyScope(kCMIOObjectPropertyScopeGlobal), mElement: CMIOObjectPropertyElement(kCMIOObjectPropertyElementMain))
        var used: UInt32 = 0
        return CMIOObjectGetPropertyData(obj, &a, 0, nil, size, &used, &v) == 0 && v != 0
    }
    var a = AudioObjectPropertyAddress(mSelector: sel, mScope: kAudioObjectPropertyScopeGlobal, mElement: kAudioObjectPropertyElementMain)
    return AudioObjectGetPropertyData(obj, &a, 0, nil, &size, &v) == 0 && v != 0
}

func devices(cmio: Bool) -> [UInt32] {
    var size: UInt32 = 0
    if cmio {
        var a = CMIOObjectPropertyAddress(mSelector: CMIOObjectPropertySelector(kCMIOHardwarePropertyDevices), mScope: CMIOObjectPropertyScope(kCMIOObjectPropertyScopeGlobal), mElement: CMIOObjectPropertyElement(kCMIOObjectPropertyElementMain))
        guard CMIOObjectGetPropertyDataSize(CMIOObjectID(kCMIOObjectSystemObject), &a, 0, nil, &size) == 0 else { return [] }
        var ids = [UInt32](repeating: 0, count: Int(size) / 4); var used: UInt32 = 0
        _ = CMIOObjectGetPropertyData(CMIOObjectID(kCMIOObjectSystemObject), &a, 0, nil, size, &used, &ids); return ids
    }
    var a = AudioObjectPropertyAddress(mSelector: kAudioHardwarePropertyDevices, mScope: kAudioObjectPropertyScopeGlobal, mElement: kAudioObjectPropertyElementMain)
    guard AudioObjectGetPropertyDataSize(AudioObjectID(kAudioObjectSystemObject), &a, 0, nil, &size) == 0 else { return [] }
    var ids = [UInt32](repeating: 0, count: Int(size) / 4)
    _ = AudioObjectGetPropertyData(AudioObjectID(kAudioObjectSystemObject), &a, 0, nil, &size, &ids); return ids
}

func hasInput(_ d: UInt32) -> Bool {
    var a = AudioObjectPropertyAddress(mSelector: kAudioDevicePropertyStreams, mScope: kAudioDevicePropertyScopeInput, mElement: kAudioObjectPropertyElementMain)
    var size: UInt32 = 0
    return AudioObjectGetPropertyDataSize(d, &a, 0, nil, &size) == 0 && size > 0
}

if devices(cmio: true).contains(where: { running($0, CMIOObjectPropertySelector(kCMIODevicePropertyDeviceIsRunningSomewhere), cmio: true) }) { print("camera") }
else if devices(cmio: false).contains(where: { hasInput($0) && running($0, kAudioDevicePropertyDeviceIsRunningSomewhere, cmio: false) }) { print("mic") }
