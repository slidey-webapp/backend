import PersonTable from "./person.model";

export const createPerson = async ({ accountID, fullname }) => {
    const newPerson = (
        await PersonTable.create({
            accountID,
            fullname,
        })
    ).get({
        plain: true,
    });
    return newPerson;
};

export const findPerson = async (data) => {
    if (data) {
        return PersonTable.findOne({
            raw: true,
            where: {
                ...data,
            },
        });
    }
    return null;
};
