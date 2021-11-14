const UpArrow = 65;
const DownArrow = 66;
const RightArrow = 67;
const LeftArrow = 68;
const keyState = {};
let steeringIsZero = false;

const PoweredUP = require("node-poweredup");
const poweredUP = new PoweredUP.PoweredUP();

poweredUP.on("discover", async (hub) => {
    console.log(`Discovered ${hub.name}! Connecting...`);
    await hub.connect(); // Connect to the Hub
    console.log('Connected!');
    console.log({
        batteryLevel: hub.batteryLevel,
        firmwareVersion: hub.firmwareVersion,
        hardwareVersion: hub.hardwareVersion,
        rssi: hub.rssi,
        type: hub.type
    });

    const mAcceleration = await hub.waitForDeviceAtPort("A"); // Make sure a motor is plugged into port A
    const mSteer = await hub.waitForDeviceAtPort("B"); // Make sure a motor is plugged into port B
    await mSteer.gotoRealZero();
    steeringIsZero = true;

    const stdin = process.stdin;
    stdin.setRawMode( true );
    stdin.resume();

    stdin.on( 'data', function( key ){
        const keyCode = key[2];
        keyState[keyCode] = +new Date();
    });

    const handler = async () => {
        if (keyState[UpArrow]) {
            await mAcceleration.setPower(-25);
        } else if (keyState[DownArrow]) {
            await mAcceleration.setPower(25);
        } else {
            await mAcceleration.setPower(0);
        }

        if (keyState[LeftArrow]) {
            // mSteer.gotoAngle(30, 100);
            // mSteer.rotateByDegrees(1, 100);
            await mSteer.setPower(-25);
            steeringIsZero = false;
        } else if (keyState[RightArrow]) {
            // mSteer.gotoAngle(30, -100);
            // mSteer.rotateByDegrees(1, -100);
            await mSteer.setPower(25);
            steeringIsZero = false;
        } else {
            // await mSteer.setPower(0);
            if (!steeringIsZero) {
                await mSteer.gotoRealZero();
                steeringIsZero = true;
            }   
        }

        const now = +new Date();
        Object.keys(keyState).forEach((k) => {
            if (now - keyState[k] > 35) {
                delete keyState[k];
            }
        });

        setTimeout(handler);
    };
    handler();
});

poweredUP.scan(); // Start scanning for Hubs
console.log("Scanning for hubs...");
