const secretKey = "yopah4rxTG36FImP";
let html5Qrcode = null;

document.getElementById('startButton').addEventListener('click', startScanner);

async function startScanner() {
    try {
        // 先確認是否有取得相機權限
        const permissionResult = await navigator.permissions.query({ name: 'camera' });
        if (permissionResult.state === 'denied') {
            alert('請允許使用相機權限');
            return;
        }

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

// 修改解密函數以處理新的 QR Code 格式
function decryptData(encryptedData) {
    try {
        // 1. 記錄原始數據
        console.log('原始掃描數據:', encryptedData);

        // 2. 嘗試解析 JSON
        let qrData;
        try {
            const jsonData = JSON.parse(encryptedData);
            qrData = jsonData.qrCodeData;
            console.log('從JSON解析的qrCodeData:', qrData);
        } catch (e) {
            qrData = encryptedData;
            console.log('使用原始數據作為qrCodeData:', qrData);
        }

        // 3. 進行解密前的準備
        const key = CryptoJS.enc.Utf8.parse(secretKey); // 正確處理密鑰
        console.log('使用的密鑰:', secretKey);

        // 4. 執行解密
        const decryptedBytes = CryptoJS.AES.decrypt(
            qrData,
            key,
            {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            }
        );
        console.log('解密後的bytes:', decryptedBytes);

        // 5. 轉換結果
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
        console.log('解密後的文本:', decryptedText);

        // 6. 檢查結果
        if (!decryptedText) {
            throw new Error("解密結果為空");
        }

        // 7. 嘗試解析解密後的 JSON
        try {
            const jsonResult = JSON.parse(decryptedText);
            console.log('解析JSON成功:', jsonResult);
            return JSON.stringify(jsonResult, null, 2); // 格式化輸出
        } catch (e) {
            console.log('結果不是JSON格式，返回原文');
            return decryptedText;
        }

    } catch (e) {
        console.error('解密過程出錯:', e);
        throw e;
    }
}

function onScanSuccess(decodedText, decodedResult) {
    console.log('掃描成功，開始處理');

    // 顯示原始掃描結果
    document.getElementById('scannedText').innerText = decodedText;

    try {
        // 嘗試解密
        const decryptedText = decryptData(decodedText);
        console.log('解密完成:', decryptedText);

        // 顯示解密結果
        document.getElementById('decodedText').innerText = decryptedText;
    } catch (error) {
        console.error('處理掃描結果時出錯:', error);
        document.getElementById('decodedText').innerText = `解密失敗: ${error.message}`;
    }

    stopScanner();
}

function onScanError(errorMessage) {
    console.log(errorMessage);
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