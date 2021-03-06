/**
 * Port of patch script to javascript for web patcher
 */

/**
 * File selected by file picker
 */
const settings = {
    file: undefined,
    shouldPatchEasy: true,
    next: false // get 'latest' version
};

let readFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            let contents = e.target.result
            resolve(contents);
        }
        reader.onerror = function (e) {
            reject(e);
        }
        reader.readAsArrayBuffer(file.target.files[0]);
    })
}

let downloadFile = (data, filename, mime) => {
    const blob = new Blob([data], {type: mime || 'application/octet-stream'});
    const blobURL = window.URL.createObjectURL(blob);
    const tempLink = document.createElement('a');
    tempLink.style.display = 'none';
    tempLink.href = blobURL;
    tempLink.setAttribute('download', filename);
    if (typeof tempLink.download === 'undefined') {
        tempLink.setAttribute('target', '_blank');
    }
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    setTimeout(() => {
        window.URL.revokeObjectURL(blobURL);
    }, 100);
}

let onStable = async () => {
    settings.next = app.next;
    onStart();
}

let onNext = async () => {
    settings.next = true;
    onStart();
}

let onStart = async () => {
    let e = settings.file;
    if (!e) {
        error('Select a file first!');
        return;
    }

    // get settings props
    settings.shouldPatchEasy = app.shouldPatchEasy;

    const cksum_offset = [0x10, 0x14]
    let content = new DataView(await readFile(e));
    if (e.target.files[0].size > 16000000) {
        error('File is too large!');
        return;
    }
    swapToZ64(content, e.target.files[0].name);
    let basecrc = await crc(content);
    clearErr();
    if (!isCrcOk(basecrc)) {
        error('Bad checksum. Did you select the right ROM?');
        return;
    }

    if (!settings.next) {
        content = await patch(content, settings);
    } else {
        content = await patch(content, settings, NEXT_PAYLOAD_PATH, NEXT_CODE_PATH, NEXT_ENTRY_PATH);
    }
    let cksm = await crc(content);

    content.setUint32(cksum_offset[0], cksm[0], false);
    content.setUint32(cksum_offset[1], cksm[1], false);

    downloadFile(content.buffer, 'glover_patched.z64');
}

let onFilePick = async (e) => {
    settings.file = e;
}

let clearErr = () => {
    app.warning_message = '';
    app.error_message = '';
}

let warning = (message) => {
    logger.warning(message);

    app.warning_message = message;
}

let error = (message) => {
    logger.error(message);

    app.error_message = message;
}

document.getElementById('file-input').addEventListener('change', onFilePick, false);
document.getElementById('start-patch').addEventListener('click', onStable);
document.getElementById('start-next-patch').addEventListener('click', onNext);
