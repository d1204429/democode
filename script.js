// script.js
const secretKey = "YourSecretKey123";
let html5QrcodeScanner = null;

async function startScanner() {
    try {
        // 先請求相機權限
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // 立即停止，等掃描器使用

        document.getElementById('reader').style.display = 'block';
        document.getElementById('startButton').style.display = 'none';

        html5QrcodeScanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } }
        );
        html5QrcodeScanner.render(onScanSuccess, onScanError);

    } catch (err) {
        alert('請允許使用相機權限：' + err.message);
    }
}

function decryptData(encryptedData) {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return "解密失敗: " + e.message;
    }
}

function onScanSuccess(decodedText) {
    const decryptedText = decryptData(decodedText);
    document.getElementById('result').innerHTML = `
        <h3>掃描結果</h3>
        <p>QR Code: ${decodedText}</p>
        <p>解密結果: ${decryptedText}</p>
        <button onclick="resetScanner()">重新掃描</button>
    `;
    html5QrcodeScanner.clear();
}

function onScanError(error) {
    console.warn(`掃描錯誤: ${error}`);
}

function resetScanner() {
    document.getElementById('result').innerHTML = '';
    document.getElementById('startButton').style.display = 'block';
    document.getElementById('reader').style.display = 'none';
}