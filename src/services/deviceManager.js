/**
 * InputNexus - Universal Device Management & Realtime Input Engine
 * Supports WebGamepad API, WebHID, Keyboard & Mouse Events, Bluetooth Identification,
 * and Same-Category Priority / Fallback Logic.
 */

// Initial default registered devices to ensure immediate visualization
const INITIAL_DEVICES = [
  {
    id: 'kb_main',
    name: 'Realforce R3 Mechanical Keyboard',
    category: 'keyboard',
    connection: 'usb',
    vendorId: '0x0853',
    productId: '0x0100',
    enabled: true,
    status: 'ACTIVE', // ACTIVE, NEXT, OFF
    lastActive: Date.now() - 5000,
    activePulse: 0,
    telemetry: { lastKey: 'W', pressedKeys: [], keyCount: 1420 },
    icon: 'keyboard'
  },
  {
    id: 'kb_tartarus',
    name: 'Razer Tartarus Pro (左手デバイス / Keypad)',
    category: 'keyboard',
    connection: 'usb',
    vendorId: '0x1532',
    productId: '0x0244',
    enabled: true,
    status: 'NEXT',
    lastActive: Date.now() - 12000,
    activePulse: 0,
    telemetry: { lastKey: 'Thumbstick Up', pressedKeys: [], keyCount: 890 },
    icon: 'gamepad-2'
  },
  {
    id: 'kb_bt_mini',
    name: 'Logitech Keys-To-Go (BT Mini Keyboard)',
    category: 'keyboard',
    connection: 'bluetooth',
    vendorId: '0x046D',
    productId: '0xB343',
    enabled: false,
    status: 'OFF',
    lastActive: 0,
    activePulse: 0,
    telemetry: { lastKey: '-', pressedKeys: [], keyCount: 120 },
    icon: 'bluetooth'
  },
  {
    id: 'gamepad_xbox',
    name: 'Xbox Wireless Controller (BT / USB-C)',
    category: 'gamepad',
    connection: 'bluetooth',
    vendorId: '0x045E',
    productId: '0x02E0',
    enabled: true,
    status: 'ACTIVE',
    lastActive: Date.now() - 2000,
    activePulse: 0,
    telemetry: {
      axes: [0, 0, 0, 0],
      buttons: Array(16).fill(false),
      lastButton: 'A Button (South)'
    },
    icon: 'gamepad'
  },
  {
    id: 'gamepad_ps5',
    name: 'DualSense Wireless Controller (PS5)',
    category: 'gamepad',
    connection: 'usb',
    vendorId: '0x054C',
    productId: '0x0CE6',
    enabled: true,
    status: 'NEXT',
    lastActive: 0,
    activePulse: 0,
    telemetry: {
      axes: [0, 0, 0, 0],
      buttons: Array(16).fill(false),
      lastButton: '-'
    },
    icon: 'gamepad'
  },
  {
    id: 'mouse_superlight',
    name: 'Logitech G PRO X SUPERLIGHT 2',
    category: 'mouse',
    connection: 'usb',
    vendorId: '0x046D',
    productId: '0xC094',
    enabled: true,
    status: 'ACTIVE',
    lastActive: Date.now() - 1000,
    activePulse: 0,
    telemetry: { deltaX: 14, deltaY: -8, buttons: [false, false, false], speed: 45 },
    icon: 'mouse'
  },
  {
    id: 'mouse_bt_trackball',
    name: 'Elecom Huge Trackball (Bluetooth)',
    category: 'mouse',
    connection: 'bluetooth',
    vendorId: '0x056E',
    productId: '0x0112',
    enabled: false,
    status: 'OFF',
    lastActive: 0,
    activePulse: 0,
    telemetry: { deltaX: 0, deltaY: 0, buttons: [false, false, false], speed: 0 },
    icon: 'bluetooth'
  }
];

class DeviceManager {
  constructor() {
    this.devices = this.loadStoredDevices() || INITIAL_DEVICES;
    this.listeners = new Set();
    this.gamepadPollId = null;
    this.activeToast = null;
    
    this.recalculateStatuses();
    this.initListeners();
  }

  loadStoredDevices() {
    try {
      const saved = localStorage.getItem('input_nexus_devices');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  saveDevices() {
    try {
      localStorage.setItem('input_nexus_devices', JSON.stringify(this.devices));
    } catch (e) {
      // ignore
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.devices, this.activeToast);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.saveDevices();
    for (const callback of this.listeners) {
      callback([...this.devices], this.activeToast);
    }
  }

  setToast(msg) {
    this.activeToast = msg;
    this.notify();
    setTimeout(() => {
      if (this.activeToast === msg) {
        this.activeToast = null;
        this.notify();
      }
    }, 4000);
  }

  /**
   * Recalculates ACTIVE, NEXT, and OFF statuses for same-category devices
   */
  recalculateStatuses() {
    const categories = ['keyboard', 'gamepad', 'mouse', 'other'];

    categories.forEach(cat => {
      const catDevices = this.devices.filter(d => d.category === cat);
      let foundActive = false;

      catDevices.forEach(device => {
        if (!device.enabled) {
          device.status = 'OFF';
        } else if (!foundActive) {
          device.status = 'ACTIVE';
          foundActive = true;
        } else {
          device.status = 'NEXT';
        }
      });
    });
  }

  toggleDevice(id) {
    const device = this.devices.find(d => d.id === id);
    if (!device) return;

    const oldEnabled = device.enabled;
    device.enabled = !device.enabled;

    // Check if turning off an ACTIVE device in a category
    if (oldEnabled && !device.enabled && device.status === 'ACTIVE') {
      const nextInLine = this.devices.find(d => d.category === device.category && d.enabled && d.id !== id);
      if (nextInLine) {
        this.setToast(`【優先度切替】${device.name} がOFFになったため、次に [${nextInLine.name}] がメインとして有効化されました。`);
      } else {
        this.setToast(`【警告】${device.category} カテゴリの全デバイスがOFFになりました。`);
      }
    } else if (!oldEnabled && device.enabled) {
      this.setToast(`【有効化】${device.name} を有効にしました。`);
    }

    this.recalculateStatuses();
    this.notify();
  }

  toggleAll(enable) {
    this.devices.forEach(d => {
      d.enabled = enable;
    });
    this.recalculateStatuses();
    this.setToast(enable ? 'すべてのデバイスを有効化しました。' : 'すべてのデバイスを無効化（ソフトミュート）しました。');
    this.notify();
  }

  triggerPulse(deviceId, telemetryUpdate = {}) {
    const device = this.devices.find(d => d.id === deviceId);
    if (!device) return;

    device.lastActive = Date.now();
    device.activePulse = 1.0; // 100% pulse energy

    if (telemetryUpdate) {
      device.telemetry = { ...device.telemetry, ...telemetryUpdate };
    }

    this.notify();
  }

  initListeners() {
    // 1. Keyboard Raw Event Listener
    window.addEventListener('keydown', (e) => {
      // Find active keyboard device
      const activeKb = this.devices.find(d => d.category === 'keyboard' && d.enabled && d.status === 'ACTIVE') 
                    || this.devices.find(d => d.category === 'keyboard' && d.enabled);

      if (activeKb) {
        const keyName = e.key === ' ' ? 'Space' : e.key;
        this.triggerPulse(activeKb.id, {
          lastKey: keyName,
          keyCount: (activeKb.telemetry.keyCount || 0) + 1
        });
      }
    });

    // 2. Mouse Movement & Click Listener
    window.addEventListener('mousemove', (e) => {
      const activeMouse = this.devices.find(d => d.category === 'mouse' && d.enabled && d.status === 'ACTIVE');
      if (activeMouse && (Math.abs(e.movementX) > 2 || Math.abs(e.movementY) > 2)) {
        const speed = Math.round(Math.sqrt(e.movementX * e.movementX + e.movementY * e.movementY));
        this.triggerPulse(activeMouse.id, {
          deltaX: e.movementX,
          deltaY: e.movementY,
          speed: speed
        });
      }
    });

    window.addEventListener('mousedown', (e) => {
      const activeMouse = this.devices.find(d => d.category === 'mouse' && d.enabled && d.status === 'ACTIVE');
      if (activeMouse) {
        const btns = [e.button === 0, e.button === 1, e.button === 2];
        this.triggerPulse(activeMouse.id, {
          buttons: btns,
          lastAction: e.button === 0 ? 'Left Click' : e.button === 2 ? 'Right Click' : 'Middle Click'
        });
      }
    });

    // 3. Web Gamepad API Polling
    const pollGamepads = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      let foundAny = false;

      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (!gp) continue;

        foundAny = true;
        // Check if gamepad is registered, if not auto-register!
        let registeredGp = this.devices.find(d => d.id === `gamepad_${gp.index}`);
        if (!registeredGp) {
          const isBt = gp.id.toLowerCase().includes('bluetooth') || gp.id.toLowerCase().includes('wireless');
          registeredGp = {
            id: `gamepad_${gp.index}`,
            name: gp.id || `Gamepad #${gp.index + 1}`,
            category: 'gamepad',
            connection: isBt ? 'bluetooth' : 'usb',
            vendorId: '0x' + (gp.id.match(/Vendor: ([0-9a-f]{4})/i)?.[1] || '045E'),
            productId: '0x' + (gp.id.match(/Product: ([0-9a-f]{4})/i)?.[1] || '02E0'),
            enabled: true,
            status: 'ACTIVE',
            lastActive: Date.now(),
            activePulse: 0,
            telemetry: { axes: [0, 0, 0, 0], buttons: [], lastButton: '-' },
            icon: isBt ? 'bluetooth' : 'gamepad'
          };
          this.devices.push(registeredGp);
          this.recalculateStatuses();
          this.setToast(`【新検出】新しいコントローラー [${registeredGp.name}] が接続されました！`);
        }

        // Check active inputs (button press or stick movement)
        let isPressed = false;
        let pressedBtnName = '-';

        gp.buttons.forEach((b, btnIdx) => {
          if (b.pressed) {
            isPressed = true;
            pressedBtnName = `Btn ${btnIdx} (${Math.round(b.value * 100)}%)`;
          }
        });

        const axes = gp.axes.slice(0, 4);
        const stickMoved = axes.some(a => Math.abs(a) > 0.15);

        if ((isPressed || stickMoved) && registeredGp.enabled) {
          this.triggerPulse(registeredGp.id, {
            axes: axes,
            buttons: gp.buttons.map(b => b.pressed),
            lastButton: isPressed ? pressedBtnName : `Stick (${axes[0].toFixed(2)}, ${axes[1].toFixed(2)})`
          });
        }
      }

      this.gamepadPollId = requestAnimationFrame(pollGamepads);
    };

    pollGamepads();

    // 4. WebHID Scanner for Left-hand Keypads & Custom Devices
    if ('hid' in navigator) {
      navigator.hid.addEventListener('connect', (e) => {
        const device = e.device;
        const isBt = device.productName?.toLowerCase().includes('bluetooth') || false;
        const newDev = {
          id: `hid_${device.vendorId}_${device.productId}`,
          name: device.productName || 'Custom HID Input Device',
          category: device.productName?.toLowerCase().includes('key') ? 'keyboard' : 'other',
          connection: isBt ? 'bluetooth' : 'usb',
          vendorId: `0x${device.vendorId.toString(16).padStart(4, '0')}`,
          productId: `0x${device.productId.toString(16).padStart(4, '0')}`,
          enabled: true,
          status: 'ACTIVE',
          lastActive: Date.now(),
          activePulse: 0,
          telemetry: { lastKey: 'Connected' },
          icon: 'plug'
        };
        
        if (!this.devices.some(d => d.id === newDev.id)) {
          this.devices.push(newDev);
          this.recalculateStatuses();
          this.setToast(`【WebHID検出】新しいHIDデバイス [${newDev.name}] を認識しました！`);
        }
      });
    }
  }

  /**
   * Scans for missing devices or requests WebHID access
   */
  async scanForDevices() {
    let newCount = 0;
    if ('hid' in navigator) {
      try {
        const hidDevices = await navigator.hid.requestDevice({ filters: [] });
        hidDevices.forEach(d => {
          const id = `hid_${d.vendorId}_${d.productId}`;
          if (!this.devices.some(dev => dev.id === id)) {
            this.devices.push({
              id: id,
              name: d.productName || 'WebHID Input Device',
              category: 'keyboard',
              connection: 'usb',
              vendorId: `0x${d.vendorId.toString(16).padStart(4, '0')}`,
              productId: `0x${d.productId.toString(16).padStart(4, '0')}`,
              enabled: true,
              status: 'NEXT',
              lastActive: Date.now(),
              activePulse: 1.0,
              telemetry: { lastKey: 'Scanned' },
              icon: 'plug'
            });
            newCount++;
          }
        });
      } catch (e) {
        // User cancelled picker
      }
    }

    this.recalculateStatuses();
    if (newCount > 0) {
      this.setToast(`スキャン完了: ${newCount} 台のデバイスが新しく検出されました！`);
    } else {
      this.setToast('全デバイスのスキャン完了。新しく追加されたデバイスはありません。');
    }
    this.notify();
  }
}

export const deviceManager = new DeviceManager();
