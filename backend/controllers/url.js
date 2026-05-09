const {nanoid}=require("nanoid");
const URl =require('../models/url')

async function handleGenerateNewShortURL(req,res){
    const shortID = nanoid(8);
    const body = req.body;

    if(!body.url) return res.status(400).json({error :"url is required"});


    try {
    await URl.create({
        shortId: shortID,
        redirectURL: body.url,
        visitHistory: []
    });

    return res.status(201).json({ id: shortID });

} catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
}
}

async function handleGetAnalytics(req,res){
    const shortID= req.params.shortId;
    const result = await URl.findOne({shortId:shortID})
    return res.json({
        totalClicks: result.visitHistory.length,
        analytics: result.visitHistory,
    })


}
async function handleRedirectURL(req, res) {
    const shortId = req.params.shortId;
    
    try {
        // Find the URL in the database and push a new timestamp to the visit array
        const entry = await URl.findOneAndUpdate(
            { shortId: shortId },
            {
                $push: {
                    visitHistory: { timestamp: Date.now() }
                }
            }
        );

        // If the short ID doesn't exist in the database
        if (!entry) {
            return res.status(404).send("URL not found");
        }

        // Redirect the user to their original long link (e.g., YouTube)
        return res.redirect(entry.redirectURL);
        
    } catch (error) {
        console.error("Redirect error:", error);
        return res.status(500).send("Internal Server Error");
    }
}
module.exports={
    handleGenerateNewShortURL,
    handleGetAnalytics,
    handleRedirectURL,
}