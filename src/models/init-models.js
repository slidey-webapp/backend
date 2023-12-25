import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _Account from "./account.js";
import _AccountRole from "./accountRole.js";
import _AccountToken from "./accountToken.js";
import _Collaboration from "./collaboration.js";
import _Group from "./group.js";
import _GroupMember from "./groupMember.js";
import _HeadingSlide from "./headingSlide.js";
import _Message from "./message.js";
import _MultipleChoiceSlide from "./multipleChoiceSlide.js";
import _MultipleChoiceSlideOption from "./multipleChoiceSlideOption.js";
import _ParagraphSlide from "./paragraphSlide.js";
import _Person from "./person.js";
import _Presentation from "./presentation.js";
import _PresentSession from "./presentSession.js";
import _Question from "./question.js";
import _QuestionVote from "./questionVote.js";
import _Role from "./role.js";
import _RoleClaim from "./roleClaim.js";
import _SessionParticipant from "./sessionParticipant.js";
import _Slide from "./slide.js";
import _SlideResult from "./slideResult.js";

export default function initModels(sequelize) {
    const Account = _Account.init(sequelize, DataTypes);
    const AccountRole = _AccountRole.init(sequelize, DataTypes);
    const AccountToken = _AccountToken.init(sequelize, DataTypes);
    const Collaboration = _Collaboration.init(sequelize, DataTypes);
    const Group = _Group.init(sequelize, DataTypes);
    const GroupMember = _GroupMember.init(sequelize, DataTypes);
    const HeadingSlide = _HeadingSlide.init(sequelize, DataTypes);
    const Message = _Message.init(sequelize, DataTypes);
    const MultipleChoiceSlide = _MultipleChoiceSlide.init(sequelize, DataTypes);
    const MultipleChoiceSlideOption = _MultipleChoiceSlideOption.init(sequelize, DataTypes);
    const ParagraphSlide = _ParagraphSlide.init(sequelize, DataTypes);
    const Person = _Person.init(sequelize, DataTypes);
    const Presentation = _Presentation.init(sequelize, DataTypes);
    const PresentSession = _PresentSession.init(sequelize, DataTypes);
    const Question = _Question.init(sequelize, DataTypes);
    const QuestionVote = _QuestionVote.init(sequelize, DataTypes);
    const Role = _Role.init(sequelize, DataTypes);
    const RoleClaim = _RoleClaim.init(sequelize, DataTypes);
    const SessionParticipant = _SessionParticipant.init(sequelize, DataTypes);
    const Slide = _Slide.init(sequelize, DataTypes);
    const SlideResult = _SlideResult.init(sequelize, DataTypes);

    AccountRole.belongsTo(Account, { foreignKey: "accountID" });
    Account.hasMany(AccountRole, { foreignKey: "accountID" });
    AccountToken.belongsTo(Account, { foreignKey: "accountID" });
    Account.hasMany(AccountToken, { foreignKey: "accountID" });
    Collaboration.belongsTo(Account, { foreignKey: "accountID" });
    Account.hasMany(Collaboration, { foreignKey: "accountID" });
    Group.belongsTo(Account, { foreignKey: "createdBy" });
    Account.hasMany(Group, { foreignKey: "createdBy" });
    GroupMember.belongsTo(Account, { foreignKey: "accountID" });
    Account.hasMany(GroupMember, { foreignKey: "accountID" });
    Person.belongsTo(Account, { foreignKey: "accountID" });
    Account.hasOne(Person, { foreignKey: "accountID" });
    GroupMember.belongsTo(Group, { foreignKey: "groupID" });
    Group.hasMany(GroupMember, { foreignKey: "groupID" });
    PresentSession.belongsTo(Group, { foreignKey: "groupID" });
    Group.hasMany(PresentSession, { foreignKey: "groupID" });
    MultipleChoiceSlideOption.belongsTo(MultipleChoiceSlide, { foreignKey: "slideID" });
    MultipleChoiceSlide.hasMany(MultipleChoiceSlideOption, { foreignKey: "slideID" });
    Collaboration.belongsTo(Presentation, { foreignKey: "presentationID" });
    Presentation.hasMany(Collaboration, { foreignKey: "presentationID" });
    Group.belongsTo(Presentation, { foreignKey: "sharedPresentationID" });
    Presentation.hasMany(Group, { foreignKey: "sharedPresentationID" });
    PresentSession.belongsTo(Presentation, { foreignKey: "presentationID" });
    Presentation.hasMany(PresentSession, { foreignKey: "presentationID" });
    Slide.belongsTo(Presentation, { foreignKey: "presentationID" });
    Presentation.hasMany(Slide, { foreignKey: "presentationID" });
    Message.belongsTo(PresentSession, { foreignKey: "sessionID" });
    PresentSession.hasMany(Message, { foreignKey: "sessionID" });
    Presentation.belongsTo(PresentSession, { foreignKey: "sessionID" });
    PresentSession.hasMany(Presentation, { foreignKey: "sessionID" });
    Question.belongsTo(PresentSession, { foreignKey: "sessionID" });
    PresentSession.hasMany(Question, { foreignKey: "sessionID" });
    SessionParticipant.belongsTo(PresentSession, { foreignKey: "sessionID" });
    PresentSession.hasMany(SessionParticipant, { foreignKey: "sessionID" });
    QuestionVote.belongsTo(Question, { foreignKey: "questionID" });
    Question.hasMany(QuestionVote, { foreignKey: "questionID" });
    AccountRole.belongsTo(Role, { foreignKey: "roleID" });
    Role.hasMany(AccountRole, { foreignKey: "roleID" });
    RoleClaim.belongsTo(Role, { foreignKey: "roleID" });
    Role.hasMany(RoleClaim, { foreignKey: "roleID" });
    Message.belongsTo(SessionParticipant, { foreignKey: "participantID" });
    SessionParticipant.hasMany(Message, { foreignKey: "participantID" });
    Question.belongsTo(SessionParticipant, { foreignKey: "participantID" });
    SessionParticipant.hasMany(Question, { foreignKey: "participantID" });
    QuestionVote.belongsTo(SessionParticipant, { foreignKey: "participantID" });
    SessionParticipant.hasMany(QuestionVote, { foreignKey: "participantID" });
    SlideResult.belongsTo(SessionParticipant, { foreignKey: "participantID" });
    SessionParticipant.hasMany(SlideResult, { foreignKey: "participantID" });
    HeadingSlide.belongsTo(Slide, { foreignKey: "slideID" });
    Slide.hasOne(HeadingSlide, { foreignKey: "slideID" });
    MultipleChoiceSlide.belongsTo(Slide, { foreignKey: "slideID" });
    Slide.hasOne(MultipleChoiceSlide, { foreignKey: "slideID" });
    ParagraphSlide.belongsTo(Slide, { foreignKey: "slideID" });
    Slide.hasOne(ParagraphSlide, { foreignKey: "slideID" });
    Presentation.belongsTo(Slide, { foreignKey: "currentSlideID" });
    Slide.hasMany(Presentation, { foreignKey: "currentSlideID" });
    SlideResult.belongsTo(Slide, { foreignKey: "slideID" });
    Slide.hasMany(SlideResult, { foreignKey: "slideID" });

    return {
        Account,
        AccountRole,
        AccountToken,
        Collaboration,
        Group,
        GroupMember,
        HeadingSlide,
        Message,
        MultipleChoiceSlide,
        MultipleChoiceSlideOption,
        ParagraphSlide,
        Person,
        Presentation,
        PresentSession,
        Question,
        QuestionVote,
        Role,
        RoleClaim,
        SessionParticipant,
        Slide,
        SlideResult,
    };
}
