function decryptData(encryptedData) {
    try {
        console.log('收到的原始數據:', encryptedData);

        // 如果是 JSON 字符串，先解析它
        let qrData;
        try {
            const jsonData = JSON.parse(encryptedData);
            qrData = jsonData.qrCodeData;
            console.log('解析出的 qrCodeData:', qrData);
        } catch (e) {
            // 如果不是 JSON，直接使用原始數據
            qrData = encryptedData;
        }

        // 使用 CryptoJS 解密
        const decryptedBytes = CryptoJS.AES.decrypt(
            qrData,  // 使用提取出的 qrCodeData
            secretKey,
            {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            }
        );

        console.log('解密後的 bytes:', decryptedBytes);

        // 轉換為文本
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
        console.log('解密後的文本:', decryptedText);

        if (!decryptedText) {
            throw new Error("解密結果為空");
        }

        return decryptedText;
    } catch (e) {
        console.error('解密錯誤:', e);
        throw new Error(`解密失敗: ${e.message}`);
    }
}

function onScanSuccess(decodedText, decodedResult) {
    console.log('掃描到的文本:', decodedText);

    document.getElementById('scannedText').innerText = decodedText;

    try {
        const decryptedText = decryptData(decodedText);

        // 嘗試解析解密後的文本為 JSON
        try {
            const jsonData = JSON.parse(decryptedText);
            document.getElementById('decodedText').innerText =
                JSON.stringify(jsonData, null, 2);
        } catch {
            // 如果不是 JSON，直接顯示解密後的文本
            document.getElementById('decodedText').innerText = decryptedText;
        }
    } catch (error) {
        document.getElementById('decodedText').innerText = `解密失敗: ${error.message}`;
    }

    stopScanner();
}

// 修改 secretKey 的初始化方式，確保使用正確的編碼
const secretKey = CryptoJS.enc.Utf8.parse("yopah4rxTG36FImP");