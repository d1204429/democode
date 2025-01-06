const secretKey = "yopah4rxTG36FImP";
let html5Qrcode = null;

document.getElementById('startButton').addEventListener('click', startScanner);

// 日誌函數
function log(label, data = '') {
    const debugLog = document.getElementById('debugLog');
    const timestamp = new Date().toLocaleTimeString();
    debugLog.innerHTML += `[${timestamp}] ${label}\n`;
    if (data) {
        debugLog.innerHTML += `    ${JSON.stringify(data, null, 2)}\n`;
    }
    debugLog.scrollTop = debugLog.scrollHeight;
}

function decryptData(encryptedData) {
    try {
        log('開始解密', encryptedData);

        let qrData;
        try {
            const jsonData = JSON.parse(encryptedData);
            qrData = jsonData.qrCodeData;
            log('解析JSON後的qrCodeData', qrData);
        } catch (e) {
            qrData = encryptedData;
            log('使用原始數據', qrData);
        }

        log('使用的密鑰', secretKey);

        const decryptedBytes = CryptoJS.AES.decrypt(
            qrData,
            secretKey,
            {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            }
        );
        log('解密後的bytes', decryptedBytes.toString());

        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
        log('解密後的文本', decryptedText);

        if (!decryptedText) {
            throw new Error("解密結果為空");
        }

        return decryptedText;
    } catch (e) {
        log('解密錯誤', e.message);
        throw e;
    }
}

function onScanSuccess(decodedText, decodedResult) {
    log('掃描成功');
    document.getElementById('scannedText').innerText = decodedText;

    try {
        const decryptedText = decryptData(decodedText);
        document.getElementById('decodedText').innerText = decryptedText;
    } catch (error) {
        document.getElementById('decodedText').innerText = `解密失敗: ${error.message}`;
    }

    stopScanner();
}

function onScanError(errorMessage) {
    // 避免過多的錯誤日誌
    // log('掃描錯誤', errorMessage);
}

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

            log('掃描器啟動成功');
        } else {
            throw new Error('沒有找到可用的相機');
        }
    } catch (err) {
        console.error('相機錯誤:', err);
        alert('啟動相機失敗，請確保已授予相機權限：' + err.message);
        log('相機錯誤', err.message);
        resetUI();
    }
}

function stopScanner() {
    if (html5Qrcode) {
        html5Qrcode.stop().then(() => {
            document.getElementById('startButton').style.display = 'block';
            document.getElementById('reader').style.display = 'none';
            log('掃描器已停止');
        }).catch((err) => {
            log('停止掃描器時發生錯誤', err.message);
        });
    }
}

function resetUI() {
    document.getElementById('startButton').style.display = 'block';
    document.getElementById('reader').style.display = 'none';
    document.getElementById('scannedText').innerText = '';
    document.getElementById('decodedText').innerText = '';
    log('UI已重置');
}