import cors from "cors";

const myCors = (arrayOfOrigin) => {
    if (!arrayOfOrigin) {
        return cors();
    }
    return cors({
        origin: arrayOfOrigin || [],
        optionsSuccessStatus: 200,
    });
};

export default myCors;
