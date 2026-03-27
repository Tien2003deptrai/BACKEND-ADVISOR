const masterDataService = require("../services/masterData.service");

class MasterDataController {
    async createDepartment(req, res, next) {
        try {
            const result = await masterDataService.createDepartment(req.body);
            return res.status(201).json({ message: "Create department successfully", data: result });
        } catch (error) {
            next(error);
        }
    }

    async listDepartments(req, res, next) {
        try {
            const result = await masterDataService.listDepartments(req.body);
            return res.status(200).json({ message: "Get departments successfully", data: result });
        } catch (error) {
            next(error);
        }
    }

    async createMajor(req, res, next) {
        try {
            const result = await masterDataService.createMajor(req.body);
            return res.status(201).json({ message: "Create major successfully", data: result });
        } catch (error) {
            next(error);
        }
    }

    async listMajors(req, res, next) {
        try {
            const result = await masterDataService.listMajors(req.body);
            return res.status(200).json({ message: "Get majors successfully", data: result });
        } catch (error) {
            next(error);
        }
    }

    async createTerm(req, res, next) {
        try {
            const result = await masterDataService.createTerm(req.body);
            return res.status(201).json({ message: "Create term successfully", data: result });
        } catch (error) {
            next(error);
        }
    }

    async listTerms(req, res, next) {
        try {
            const result = await masterDataService.listTerms(req.body);
            return res.status(200).json({ message: "Get terms successfully", data: result });
        } catch (error) {
            next(error);
        }
    }

    async getActiveTerm(req, res, next) {
        try {
            const result = await masterDataService.getActiveTerm();
            return res.status(200).json({ message: "Get active term successfully", data: result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MasterDataController();
