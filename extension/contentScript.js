const main = async () => {
    const src = chrome.runtime.getURL("finder.medv.js");
    const { finder } = await import(src);

    document.addEventListener("click", (event) => {
        console.log(finder(event.target))
    })
}

main()
