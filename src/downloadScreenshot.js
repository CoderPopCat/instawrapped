import html2canvas from "html2canvas";
const exportAsImage = async (element, imageFileName) => {
    document.querySelector(".at").style["background-image"] = "unset";
    document.querySelector(".donate").style.display = 'none';
    const downloadImage = (blob, fileName) => {
        const fakeLink = window.document.createElement("a");
        fakeLink.style = "display:none;";
        fakeLink.download = fileName;

        fakeLink.href = blob;

        document.body.appendChild(fakeLink);
        fakeLink.click();
        document.body.removeChild(fakeLink);

        fakeLink.remove();
    };

    const html = document.getElementsByTagName("html")[0];
    const body = document.getElementsByTagName("body")[0];
    let htmlWidth = html.clientWidth;
    let bodyWidth = body.clientWidth;
    const newWidth = element.scrollWidth - element.clientWidth;
    if (newWidth > element.clientWidth) {
        htmlWidth += newWidth;
        bodyWidth += newWidth;
    }
    html.style.width = htmlWidth + "px";
    body.style.width = bodyWidth + "px";
    const canvas = await html2canvas(element);
    const image = canvas.toDataURL("image/png", 1.0);
    downloadImage(image, imageFileName);
    html.style.width = null;
    body.style.width = null;
    document.querySelector(".at").style["background-image"] = "linear-gradient(230deg, #405de6, #5851db, #833ab4, #c13584, #e1306c, #fd1d1d)";
    document.querySelector(".donate").style.display = '';
};
export default exportAsImage;