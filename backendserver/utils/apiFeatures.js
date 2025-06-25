class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    // Search by doctor's name
    search() {
        const keyword = this.queryStr.keyword
            ? {
                name: {
                    $regex: this.queryStr.keyword,
                    $options: "i", // Case insensitive
                },
            }
            : {};

        this.query = this.query.find({ ...keyword });
        return this;
    }

    // Filter by various criteria
    filter() {
        const queryCopy = { ...this.queryStr };

        // Remove unnecessary fields
        const removeFields = ["keyword", "page", "limit"];
        removeFields.forEach((key) => delete queryCopy[key]);

        // Specialty filter
        if (this.queryStr.specialty) {
            queryCopy.specialty = this.queryStr.specialty;
        }

        // Convert queryCopy to string and replace range operators for MongoDB ($gt, $gte, etc.)
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
}

module.exports = ApiFeatures;
