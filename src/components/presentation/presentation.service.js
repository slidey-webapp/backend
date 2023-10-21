import PresentationTable from "./presentation.model";

export const createPresentation = async ({ accountID, name, code }) => {
    const newPresentation = (
        await PresentationTable.create({
            createdBy: accountID,
            name,
            code,
        })
    ).get({
        plain: true,
    });
    return newPresentation;
};

export const findPresentation = (data) => {
    if (!data) {
        return null;
    }
    return PresentationTable.findOne({
        raw: true,
        where: {
            ...data,
        },
    });
};

export const getUserPresentation = ({ createdBy, offset, limit }) => {
    return PresentationTable.findAll({
        raw: true,
        where: {
            createdBy,
        },
        order: [["createdAt", "DESC"]],
        offset: offset,
        limit: limit,
    });
};

export const countPresentation = ({ createdBy }) => {
    return PresentationTable.count({
        raw: true,
        where: {
            createdBy,
        },
    });
};

export const updatePresentation = async ({
    name,
    currentSlideID,
    updatedBy,
    presentationID,
}) => {
    const result = await PresentationTable.update(
        {
            ...(name && { name }),
            ...(currentSlideID && { currentSlideID }),
            ...(updatedBy && { updatedBy }),
        },
        {
            where: {
                presentationID,
            },
            raw: true,
            returning: true,
        }
    );
    return result && result.length ? result[1] : null;
};
