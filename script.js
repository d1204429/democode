const secretKey = "yopah4rxTG36FImP";
let html5Qrcode = null;

document.getElementById('startButton').addEventListener('click', startScanner);

async function startScanner() {
    try {
        html5Qrcode = new Html5Qrcode("reader");
        document.getElementById('reader').style.display = 'block';
        document.getElementById('startButton').style.display = 'none';

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        };

        await html5Qrcode.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            onScanError
        );

    } catch (err) {
        console.error('相機錯誤:', err);
        alert('啟動相機失敗，請確保已授予相機權限：' + err.message);
        resetUI();
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
    // console.log(errorMessage);
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