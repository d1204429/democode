const secretKey = "yopah4rxTG36FImP";
let html5Qrcode = null;

document.getElementById('startButton').addEventListener('click', startScanner);

async function startScanner() {
    try {
        // 先嘗試獲取相機權限
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());

        document.getElementById('reader').style.display = 'block';
        document.getElementById('startButton').style.display = 'none';

        html5Qrcode = new Html5Qrcode("reader");

        // 獲取可用的相機列表
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            };

            // 使用最後一個相機（通常是後置相機）
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
        console.error('相機錯誤:', err);
        alert('啟動相機失敗，請確保已授予相機權限：' + err.message);
        resetUI();
    }
}

function onScanSuccess(decodedText, decodedResult) {
    const decryptedText = decryptData(decodedText);
    document.getElementById('scannedText').innerText = decodedText;
    document.getElementById('decodedText').innerText = decryptedText;
    stopScanner();
}

function onScanError(errorMessage) {
    console.log(errorMessage);
}

function decryptData(encryptedData) {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return "解密失敗: " + e.message;
    }
}

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