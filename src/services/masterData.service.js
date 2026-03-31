const Department = require("../models/department.model");
const Major = require("../models/major.model");
const Term = require("../models/term.model");
const throwError = require("../utils/throwError");

class MasterDataService {
    async createDepartment(body) {
        try {
            return await Department.create({
                department_code: body.department_code,
                department_name: body.department_name,
            });
        } catch (error) {
            if (error?.code === 11000) throwError("department_code already exists", 409);
            throw error;
        }
    }

    async listDepartments(body) {
        const page = Number(body.page || 1);
        const limit = Number(body.limit || 20);
        const skip = (page - 1) * limit;

        const filter = {};
        if (body.search) {
            filter.$or = [
                { department_code: { $regex: body.search, $options: "i" } },
                { department_name: { $regex: body.search, $options: "i" } },
            ];
        }

        const [items, total] = await Promise.all([
            Department.find(filter)
                .select("_id department_code department_name created_at updated_at")
                .sort({ department_code: 1 })
                .skip(skip)
                .limit(limit),
            Department.countDocuments(filter),
        ]);

        return {
            items,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit) || 1,
            },
        };
    }

    async createMajor(body) {
        const department = await Department.findById(body.department_id).select("_id");
        if (!department) throwError("department not found", 404);

        try {
            return await Major.create({
                major_code: body.major_code,
                major_name: body.major_name,
                department_id: body.department_id,
            });
        } catch (error) {
            if (error?.code === 11000) throwError("major_code already exists in this department", 409);
            throw error;
        }
    }

    async listMajors(body) {
        const page = Number(body.page || 1);
        const limit = Number(body.limit || 20);
        const skip = (page - 1) * limit;

        const filter = {};
        if (body.department_id) filter.department_id = body.department_id;
        if (body.search) {
            filter.$or = [
                { major_code: { $regex: body.search, $options: "i" } },
                { major_name: { $regex: body.search, $options: "i" } },
            ];
        }

        const [items, total] = await Promise.all([
            Major.find(filter)
                .populate("department_id", "_id department_code department_name")
                .select("_id major_code major_name department_id created_at updated_at")
                .sort({ major_code: 1 })
                .skip(skip)
                .limit(limit),
            Major.countDocuments(filter),
        ]);

        return {
            items,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit) || 1,
            },
        };
    }

    async createTerm(body) {
        const startDate = new Date(body.start_date);
        const endDate = new Date(body.end_date);
        if (startDate >= endDate) {
            throwError("end_date must be after start_date", 422);
        }

        try {
            if (body.status === "ACTIVE") {
                await Term.updateMany({ status: "ACTIVE" }, { $set: { status: "INACTIVE" } });
            }

            return await Term.create({
                term_code: body.term_code,
                academic_year: body.academic_year,
                term_name: body.term_name,
                start_date: startDate,
                end_date: endDate,
                status: body.status || "INACTIVE",
            });
        } catch (error) {
            if (error?.code === 11000) {
                if (String(error.message || "").includes("term_code")) {
                    throwError("term_code already exists", 409);
                }
                throwError("there is already an active term", 409);
            }
            throw error;
        }
    }

    async listTerms(body) {
        const page = Number(body.page || 1);
        const limit = Number(body.limit || 20);
        const skip = (page - 1) * limit;

        const filter = {};
        if (body.status) filter.status = body.status;
        if (body.search) {
            filter.$or = [
                { term_code: { $regex: body.search, $options: "i" } },
                { academic_year: { $regex: body.search, $options: "i" } },
                { term_name: { $regex: body.search, $options: "i" } },
            ];
        }

        const [items, total] = await Promise.all([
            Term.find(filter)
                .select("_id term_code academic_year term_name start_date end_date status created_at updated_at")
                .sort({ start_date: -1 })
                .skip(skip)
                .limit(limit),
            Term.countDocuments(filter),
        ]);

        return {
            items,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit) || 1,
            },
        };
    }

    async getActiveTerm() {
        const item = await Term.findOne({ status: "ACTIVE" })
            .select("_id term_code academic_year term_name start_date end_date status created_at updated_at");
        return item;
    }
}

module.exports = new MasterDataService();
