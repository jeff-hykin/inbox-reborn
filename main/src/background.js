;((async ()=>{
    let realHistoryCount = (await browser.storage.local.get("realHistoryCount")).realHistoryCount||0
    browser.history.onVisited.addListener(async ({url})=>{
        let lastHistoryEntry = null
        if (realHistoryCount > 0) {
            lastHistoryEntry = await browser.storage.local.get(`${realHistoryCount}`)[`${realHistoryCount}`]
        }
        if (!(lastHistoryEntry instanceof Array)) {
            browser.storage.local.set({
                realHistoryCount: ++realHistoryCount,
                `${realHistoryCount}`: [ url, (new Date()).getTime() ],
            })
        } else {
            const [ date, prevUrl ] = lastHistoryEntry
            if (prevUrl != url) {
                browser.storage.local.set({
                    realHistoryCount: ++realHistoryCount,
                    `${realHistoryCount}`: [ url, (new Date()).getTime() ],
                })
            }
        }
    }) 
    
    Object.defineProperty(window, "getHistory", {
        get() {
            return async (howFarBack)=>{
                if (howFarBack == null) {
                    throw Error(`please do getHistory(100) to get last 100 sites.\nIf you want all use getHistory(Infinity)`)
                }
                let start = realHistoryCount - howFarBack
                if (start < 0) {
                    start = 0
                }
                const numbersToGet = [...Array(howFarBack)].map((each, index)=>`${index+start}`)
                const response = await browser.storage.local.get(numbersToGet)
                
                return Object.entries(response).map((key, [site, time])=>[ new Date(time), site ])
            }
        }
    })
    
})())
