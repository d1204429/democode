// script.js
const secretKey = "YourSecretKey123";
document.getElementById('startButton').onclick = async () => {
    try {
        const codeReader = new ZXing.BrowserQRCodeReader();
        const videoInputDevices = await ZXing.BrowserCodeReader.listVideoInputDevices();
        const selectedDeviceId = videoInputDevices[0].deviceId;

        const result = await codeReader.decodeFromVideoDevice(selectedDeviceId, 'reader', (result) => {
            if (result) {
                const decryptedText = decryptData(result.text);
                document.getElementById('result').innerHTML = `
                    <p>掃描結果: ${result.text}</p>
                    <p>解密結果: ${decryptedText}</p>
                `;
                codeReader.reset();
            }
        });
    } catch (err) {
        console.error(err);
        alert('掃描失敗：' + err.message);
    }
};

function decryptData(encryptedData) {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return "解密失敗: " + e.message;
    }
}