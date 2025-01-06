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

        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            };

            // 使用後置相機
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
    try {
        const decryptedText = decryptData(decodedText);
        document.getElementById('scannedText').innerText = decodedText;
        document.getElementById('decodedText').innerText = decryptedText;
    } catch (error) {
        document.getElementById('decodedText').innerText = "解密失敗: " + error.message;
    }
    stopScanner();
}

function decryptData(encryptedData) {
    try {
        // 解密
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedText) {
            throw new Error("解密結果為空");
        }

        // 驗證解密後的格式
        if (!decryptedText.match(/^TIX-\d{4}-\d{6}-[a-f0-9]{8}$/)) {
            throw new Error("解密後格式不符合預期");
        }

        // 解析票券資訊
        const [prefix, year, ticketId, uuid] = decryptedText.split('-');

        return `票券資訊:
前綴: ${prefix}
年份: ${year}
票號: ${ticketId}
驗證碼: ${uuid}`;

    } catch (e) {
        console.error('詳細錯誤:', e);
        throw new Error(e.message || "解密過程出錯");
    }
}

function onScanError(errorMessage) {
    console.error('掃描錯誤:', errorMessage);
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