const secretKey = "yopah4rxTG36FImP";
let html5Qrcode = null;

document.getElementById('startButton').addEventListener('click', () => {
    startScanner().catch(err => {
        alert('相機啟動失敗: ' + err.message);
        resetUI();
    });
});

async function startScanner() {
    try {
        // 先檢查相機權限
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            stream.getTracks().forEach(track => track.stop());
        } catch(e) {
            throw new Error('請允許相機權限後重試');
        }

        html5Qrcode = new Html5Qrcode("reader");
        document.getElementById('reader').style.display = 'block';
        document.getElementById('startButton').style.display = 'none';

        await html5Qrcode.start(
            { facingMode: { exact: "environment" } },
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            onScanSuccess,
            onScanError
        );

    } catch (err) {
        throw err;
    }
}

function decryptData(encryptedData) {
    try {
        let qrData;
        try {
            const jsonData = JSON.parse(encryptedData);
            qrData = jsonData.qrCodeData;
        } catch (e) {
            qrData = encryptedData;
        }

        const decryptedBytes = CryptoJS.AES.decrypt(
            qrData,
            secretKey,
            {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            }
        );

        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedText) {
            throw new Error("解密結果為空");
        }

        return decryptedText;
    } catch (e) {
        throw e;
    }
}

function onScanSuccess(decodedText, decodedResult) {
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
    // 移除掉不必要的錯誤日誌
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