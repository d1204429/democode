const html5QrCode = new Html5Qrcode("reader");

// 預設金鑰
const publicKey = "yopah4rxTG36FImP";

/**
 * Base64 解碼函數
 * @param {string} base64String - Base64 編碼的字串
 * @returns {string} 解碼後的內容
 */
function decodeBase64(base64String) {
    try {
        return atob(base64String);
    } catch (error) {
        console.error("Base64 解碼失敗", error);
        return "Base64 解碼失敗";
    }
}

/**
 * 處理掃描成功
 */
function onScanSuccess(decodedText, decodedResult) {
    console.log("掃描成功", decodedText);

    const decodedContent = decodeBase64(decodedText);
    console.log("Base64 解碼結果", decodedContent);

    const finalResult = `解碼內容: ${decodedContent}\n金鑰: ${publicKey}`;

    html5QrCode.stop().then(() => {
        document.getElementById("result").textContent = finalResult;
    }).catch(err => {
        console.error("停止掃描錯誤", err);
    });
}

/**
 * 處理掃描錯誤
 */
function onScanError(errorMessage) {
    console.warn(`掃描錯誤: ${errorMessage}`);
}

// 初始化相機
Html5Qrcode.getCameras().then(cameras => {
    if (cameras && cameras.length) {
        const cameraId = cameras[0].id;
        html5QrCode.start(cameraId, {
            fps: 10,
            qrbox: { width: 200, height: 200 }
        }, onScanSuccess, onScanError);
    } else {
        alert("未找到可用的相機！");
    }
}).catch(err => {
    console.error("取得相機失敗", err);
});
