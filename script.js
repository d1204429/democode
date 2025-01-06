const secretKey = "yopah4rxTG36FImP";
let html5Qrcode = null;

document.getElementById('startButton').addEventListener('click', startScanner);

async function startScanner() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());

        document.getElementById('reader').style.display = 'block';
        document.getElementById('startButton').style.display = 'none';

        html5Qrcode = new Html5Qrcode("reader");

        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            };

            const cameraId = devices[devices.length - 1].id;

            await html5Qrcode.start(
                cameraId,
                config,
                onScanSuccess,
                onScanError
            );
        } else {
            throw new Error('沒有找到可用的相機');
        }
    } catch (err) {
        alert('啟動相機失敗，請確保已授予相機權限：' + err.message);
        resetUI();
    }
}

function onScanSuccess(decodedText, decodedResult) {
    // 顯示掃描到的原始資料
    document.getElementById('scannedText').innerText = String(decodedText);

    try {
        // 解密處理
        const key = CryptoJS.enc.Utf8.parse(secretKey);
        const qrData = JSON.parse(decodedText).qrCodeData;
        const decryptedBytes = CryptoJS.AES.decrypt(qrData, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });

        // 轉換為字串並顯示
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
        document.getElementById('decodedText').innerText = String(decryptedText);
    } catch (error) {
        document.getElementById('decodedText').innerText = '解密失敗: ' + String(error.message);
    }

    stopScanner();
}

function onScanError(errorMessage) {}

function stopScanner() {
    if (html5Qrcode) {
        html5Qrcode.stop().then(() => {
            document.getElementById('startButton').style.display = 'block';
            document.getElementById('reader').style.display = 'none';
        });
    }
}

function resetUI() {
    document.getElementById('startButton').style.display = 'block';
    document.getElementById('reader').style.display = 'none';
    document.getElementById('scannedText').innerText = '';
    document.getElementById('decodedText').innerText = '';
}