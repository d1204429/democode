const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const resultDiv = document.getElementById('result');

document.getElementById('startButton').addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.setAttribute('playsinline', true);
        video.play();

        requestAnimationFrame(tick);

        function tick() {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;

                const context = canvas.getContext('2d');
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });

                if (code) {
                    const decryptedText = decryptData(code.data);
                    resultDiv.innerHTML = `
                        <p>原始票券碼: ${code.data}</p>
                        <p>解密結果: ${decryptedText}</p>
                    `;
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }
            }

            requestAnimationFrame(tick);
        }
    } catch (err) {
        console.error(err);
        alert('開啟相機失敗：' + err.message);
    }
});

function decryptData(encryptedData) {
    try {
        // Base64 解碼並解密
        const bytes = CryptoJS.AES.decrypt(
            CryptoJS.enc.Base64.parse(encryptedData).toString(CryptoJS.enc.Base64),
            'yopah4rxTG36FImP' // 替換為實際的加密金鑰
        );
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        return decrypted || "解密失敗：無效的密文";
    } catch (e) {
        return "解密失敗: " + e.message;
    }
}