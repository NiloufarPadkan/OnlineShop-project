const Admin = require("../../models/Admin");
const Role = require("../../models/Role");

const genPassword = require("../../lib/passwordUtil").genPassword;

exports.insertAdmin = async (req) => {
    try {
        const saltHash = genPassword(req.body.password);
        const salt = saltHash.salt;
        const hash = saltHash.hash;
        const newAdmin = new Admin({
            username: req.body.username,
            email: req.body.email,
            phone: req.body.phone,
            avtivityStatus: req.body.avtivityStatus,
            hash: hash,
            salt: salt,
            roleId: req.body.roleId,
        });
        const savedAdmin = await newAdmin.save();
        return savedAdmin;
    } catch (e) {
        return "";
    }
};

exports.indexAdmins = async (req) => {
    try {
        const limit = req.params.size ? req.params.size : 3;
        const offset = req.params.page ? req.params.page * limit : 0;
        console.log(limit + " " + offset);
        const admins = await Admin.findAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
        return admins;
    } catch (e) {
        console.log(e);
        return "";
    }
};

exports.updateAdmin = async (req) => {
    try {
        const adminId = req.body.adminId;

        const foundAdmin = await Admin.findByPk(adminId);
        if (!foundAdmin) {
            return "adminNotFound";
        }

        const duplicateUsername = await Admin.findOne({
            where: {
                username: req.body.username,
            },
        });
        if (duplicateUsername && duplicateUsername.id !== foundAdmin.id) {
            return "duplicateUsername";
        }
        const duplicateEmail = await Admin.findOne({
            where: {
                email: req.body.email ? req.body.email : "",
            },
        });
        if (duplicateEmail && duplicateEmail.id !== foundAdmin.id) {
            return "duplicateEmail";
        }
        const duplicatephone = await Admin.findOne({
            where: {
                phone: req.body.phone ? req.body.phone : "",
            },
        });
        if (duplicatephone && duplicatephone.id !== foundAdmin.id) {
            return "duplicatePhone";
        }
        const roleId = req.body.roleId ? req.body.roleId : foundAdmin.roleId;

        const username = req.body.username ? req.body.username : foundAdmin.username;

        const email = req.body.email ? req.body.email : foundAdmin.email;

        const phone = req.body.phone ? req.body.phone : foundAdmin.phone;

        const hash = req.body.password
            ? genPassword(req.body.password).hash
            : foundAdmin.hash;

        const salt = req.body.password
            ? genPassword(req.body.password).salt
            : foundAdmin.salt;

        const activity = req.body.activity
            ? req.body.activity
            : foundAdmin.avtivityStatus;

        const foundRole = await Role.findByPk(roleId);
        if (!foundRole) {
            return "roleNotfound";
        }

        const upadmin = await Admin.findByPk(adminId).then((admin) => {
            admin.roleId = roleId;

            admin.avtivityStatus = activity;

            admin.username = username;

            admin.email = email;

            admin.phone = phone;

            admin.hash = hash;

            admin.salt = salt;

            return admin.save();
            admin.avtivityStatus = activity;
        });
        //const adminrole = await upadmin.getRole(); /*get role of admin*/
        return upadmin;
    } catch (e) {
        console.log(e);
        return "";
    }
};
exports.destroyAdmin = async (req) => {
    const adminId = req.body.adminId;
    try {
        const admin = await Admin.destroy({
            where: {
                id: adminId,
            },
        });
        //console.log(admin);
        if (admin) return true;
        else return false;
    } catch (e) {
        return false;
    }
};
