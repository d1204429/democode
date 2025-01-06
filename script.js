const html5QrCode = new Html5Qrcode("reader");
const resultDiv = document.getElementById('result');

function startScanning() {
    Html5Qrcode.getCameras().then(devices => {
        if (devices && devices.length) {
            const backCamera = devices.find(device =>
                device.label.toLowerCase().includes('back') ||
                device.label.toLowerCase().includes('rear')
            ) || devices[devices.length - 1];

            html5QrCode.start(
                backCamera.id,
                {
                    fps: 10,
                    qrbox: 250
                },
                onScanSuccess,
                onScanFailure
            );
        }
    }).catch(err => {
        resultDiv.innerHTML = `開啟相機失敗：${err.message}`;
    });
}

function onScanSuccess(decodedText, decodedResult) {
    try {
        const decryptedText = decryptData(decodedText);
        resultDiv.innerHTML = `
            <p>原始票券碼: ${decodedText}</p>
            <p>解密結果: ${decryptedText}</p>
        `;
    } catch (error) {
        resultDiv.innerHTML = `解密失敗：${error.message}`;
    }
}

function onScanFailure(error) {
    console.log(`掃描失敗：${error}`);
}

function decryptData(encryptedData) {
    try {
        const bytes = CryptoJS.AES.decrypt(
            CryptoJS.enc.Base64.parse(encryptedData).toString(CryptoJS.enc.Base64),
            'yopah4rxTG36FImP'
        );
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted || "解密失敗：無效的密文";
    } catch (e) {
        return "解密失敗: " + e.message;
    }
}

// 開始掃描
startScanning();