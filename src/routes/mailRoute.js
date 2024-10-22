const express = require("express");
const { sendMail, registerMail } = require("../controller/mailer");
const router = express.Router()

router.post('/registerMail', registerMail)
router.post('/sendMail', async (req, res) => {
    try {
        await sendMail(req.body);
        res.status(200).send({ msg: "Email sent successfully." });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router