const loginService = require("../../../services/login");
const Response = require("../../../services/responses/general");

const dict = require("../../../resources/dict");
exports.login = async (req, res, next) => {
    try {
        const loginResponse = await loginService.loginAdmin(req);

        if (loginResponse === "invalidPassword" || loginResponse === "adminNotFound") {
            let response = new Response(400, "fail", "wrongCredentials");
            if (loginResponse != "") return res.status(200).send(response.handler());
        }

        let response = new Response(200, "success", loginResponse);
        if (loginResponse != "") return res.status(200).send(response.handler());
        //res.status(200).send(res.locals.accessToken);
    } catch (e) {
        return res.status(500).send(e);
    }
};
