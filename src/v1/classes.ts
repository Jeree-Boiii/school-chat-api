// Imports
import { ObjectId } from "mongodb";


// Object superclass
abstract class Object {
    // Attributes
    protected id: ObjectId;

    // Constructor
    constructor(id: ObjectId) {
        this.id = id;
    }

    // Get ID
    getId() {return this.id}
}


// Message
export class Message extends Object {
    // Attributes
    private author: ObjectId;
    private message: string;
    private reply: ObjectId | null;
    private edited: boolean;

    // Constructor
    constructor(id: ObjectId, author: ObjectId, message: string, reply: ObjectId|null = null) {
        super(id);
        this.author = author;
        this.message = message;
        this.reply = reply;
        this.edited = false;
    }

    // Edit message
    editMessage(newMessage: string) {
        this.message = newMessage;
        this.edited = true;
    }

    // Check if message is edited
    isEdited() {return this.edited}
}


// Notice
export class Notice extends Object {
    // Attributes
    private author: ObjectId;
    private description: string;
    private image: string | null;
    
    // Constructor
    constructor(id: ObjectId, author: ObjectId, description: string, image: string|null) {
        super(id);
        this.author = author;
        this.description = description;
        this.image = image;
    }

    // Edit description
    editDescription(newDescription: string) {
        this.description = newDescription;
    }

    // Edit image
    editImage(newImage: string | null) {
        this.image = newImage;
    }
}


// Assignment
export class Assignment extends Notice {
    // Attributes
    private dueDate: Date;

    // Constructor
    constructor(id: ObjectId, author: ObjectId, description: string, image: string|null, dueDate: Date) {
        super(id, author, description, image);
        this.dueDate = dueDate;
    }

    // Edit due date
    editDueDate(newDueDate: Date) {
        this.dueDate = newDueDate;
    }
}


// Form
export class Form {
    // Attributes
    private year: number;
    private classLetter: string;

    // Constructor
    constructor(year: number, classLetter: string) {
        this.year = year;
        this.classLetter = classLetter;
    }

    // Get year
    getYear() {return this.year}

    // Get class
    getClass() {return this.classLetter}

    // Get form as string
    toString() {return this.year + this.classLetter}
}


// User
export class User extends Object {
    // Attributes
    private userName: string;
    private realName: string;
    private email: string;
    private password: string;
    private teacher: boolean;
    private form: Form;
    private classes: ObjectId[];
    private rooms: ObjectId[];

    // Constructor
    constructor(id: ObjectId, userName: string, realName: string, email: string, password: string, teacher: boolean, form: Form) {
        super(id);
        this.userName = userName;
        this.realName = realName;
        this.email = email;
        this.password = password;
        this.teacher = teacher;
        this.form = form;
        this.classes = [];
        this.rooms = [];
    }

    // Get username
    getUserName() {return this.userName}

    // Get name
    getName() {return this.realName}

    // Get email
    getEmail() {return this.email}

    // Get password
    validPassword(password: String) {return this.password == password}

    // Change password
    changePassword(oldPassword: string, newPassword: string) {
        if (oldPassword == this.password) {
            this.password = newPassword;
            return 1;
        } else {
            return -1;
        }
    }

    // Is the user a teacher
    isTeacher() {return this.teacher}

    // Get form
    getForm() {return this.form}

    // Change form
    changeForm(newForm: Form) {this.form = newForm}

    // Get classes
    getClasses() {return this.classes}
    
    // Join class
    joinClass(newClass: ObjectId) {
        for (let i=0; i<this.classes.length; i++) {
            if (this.classes[i] == newClass) return -1;
        }
        return this.classes.push(newClass);
    }

    // Leave class
    leaveClass(oldClass: ObjectId) {
        for (let i=0; i<this.classes.length; i++) {
            if (this.classes[i] == oldClass) {
                this.classes.splice(i, 1);
                return this.classes.length;
            }
        }
        return -1;
    }

    // Get rooms
    getRooms() {return this.rooms}

    // Join room
    joinRoom(newRoom: ObjectId) {
        for (let i=0; i<this.rooms.length; i++) {
            if (this.classes[i] == newRoom) return -1;
        }
        return this.classes.push(newRoom);
    }

    // Leave room
    leaveRoom(oldRoom: ObjectId) {
        for (let i=0; i<this.rooms.length; i++) {
            if (this.rooms[i] == oldRoom) {
                this.rooms.splice(i, 1);
                return this.rooms.length;
            }
        }
        return -1;
    }
}


// Room
export class Room extends Object {
    // Attributes
    private name: string;
    private owner: ObjectId;
    private messages: Message[];
    private admins: ObjectId[];
    private nonAdmins: ObjectId[];
    private allMembers: ObjectId[];

    // Constructor
    constructor(id: ObjectId, name: string, owner: ObjectId) {
        super(id);
        this.name = name;
        this.owner = owner;
        this.messages = [];
        this.admins = [owner];
        this.nonAdmins = [];
        this.allMembers = [owner];
    }

    // Get name
    getName() {return this.name}

    // Change name
    changeName(newName: string) {this.name = newName}

    // Get owner
    getOwner() {return this.owner}

    // Get messages
    getMessages() {return this.messages}

    // Add message
    addMessage(newMessage: Message) {return this.messages.push(newMessage)}

    // Get total number of members
    memberCount() {return this.allMembers.length}

    // Get number of admins
    adminCount() {return this.admins.length}

    // Get number of non-admins
    nonAdminCount() {return this.nonAdmins.length}

    // Check if user is in room
    private checkMember(member: ObjectId) {
        for (let i=0; i<this.allMembers.length; i++) {
            if (this.allMembers[i] == member) {
                return i;
            }
        }
        return -1;
    }

    // Check if user is admin
    private checkAdmin(member: ObjectId) {
        for (let i=0; i<this.admins.length; i++) {
            if (this.admins[i] == member) {
                return i;
            }
        }
        return -1;
    }

    // Check if user is non-admin
    private checkNonAdmin(member: ObjectId) {
        for (let i=0; i<this.nonAdmins.length; i++) {
            if (this.nonAdmins[i] == member) {
                return i;
            }
        }
        return -1;
    }

    // Add user to room
    addMember(member: ObjectId) {
        let isMember = this.checkMember(member);
        if (isMember != -1) {
            this.nonAdmins.push(member);
            return this.allMembers.push(member);
        }
        return -1;       
    }

    // Remove user
    removeMember(member: ObjectId) {
        if (member == this.owner) return -2;

        let memberIndex = this.checkMember(member);
        if (memberIndex != -1) this.allMembers.splice(memberIndex, 1);
        else return -1;

        let adminIndex = this.checkAdmin(member);
        if (adminIndex != -1) this.admins.splice(adminIndex, 1);
        else {
            let nonAdminIndex = this.checkNonAdmin(member);
            if (nonAdminIndex != -1) this.nonAdmins.splice(nonAdminIndex, 1);
            else return -1;
        }
        return this.allMembers.length;
    }

    // Demote users from admin to standard user
    demoteAdmin(member: ObjectId) {
        if (member == this.owner) return -2;

        let adminIndex = this.checkAdmin(member);
        if (adminIndex != -1) {
            this.admins.splice(adminIndex, 1);
            this.nonAdmins.push(member);
            return this.admins.length;
        }
        return -1;
    }

    // Promote user to admin
    promoteAdmin(member: ObjectId) {
        if (member == this.owner) return -2;

        let adminIndex = this.checkAdmin(member);
        if (adminIndex != -1) return -1;

        let nonAdminIndex = this.checkNonAdmin(member);
        if (nonAdminIndex != -1) {
            this.nonAdmins.splice(nonAdminIndex, 1);
            return this.admins.push(member);
        }

        return -1;
    }
}


// Class
export class Class extends Object {
    // Attributes
    private name: string;
    private teacher: ObjectId;
    private students: ObjectId[];
    private notices: Notice[];
    private assignments: Assignment[];

    // Constructor
    constructor(id: ObjectId, name: string, teacher: ObjectId) {
        super(id);
        this.name = name;
        this.teacher = teacher;
        this.students = [];
        this.notices = [];
        this.assignments = [];
    }

    // Get name
    getName() {return this.name}

    // Change name
    changeName(newName: string) {this.name = newName}

    // Get teacher
    getTeacher() {return this.teacher}

    // Get number of students
    studentCount() {return this.students.length}
    
    // Check if student is in class
    checkStudent(student: ObjectId) {
        for (let i=0; i<this.students.length; i++) {
            if (this.students[i] == student) {
                return i;
            }
        }
        return -1;
    }
    
    // Add student
    addStudent(newStudent: ObjectId) {
        let isStudent = this.checkStudent(newStudent);
        if (isStudent != -1) return -1;
        else return this.students.push(newStudent);
    }

    // Remove student
    removeStudent(student: ObjectId) {
        for (let i=0; i<this.students.length; i++) {
            if (this.students[i] == student) {
                this.students.splice(i, 1);
                return this.students.length;
            }
        }
        return -1;
    }

    // Add new notice
    createNotice(newNotice: Notice) {return this.notices.push(newNotice)}

    // Delete notice
    removeNotice(notice: Notice) {
        for (let i=0; i<this.notices.length; i++) {
            if (this.notices[i] == notice) {
                this.notices.splice(i, 1);
                return this.notices.length;
            }
        }
        return -1;
    }

    // Add new assignment
    createAssignment(newAssignment: Assignment) {return this.assignments.push(newAssignment)}

    // Delete assignment
    removeAssignment(assignment: Assignment) {
        for (let i=0; i<this.assignments.length; i++) {
            if (this.assignments[i] == assignment) {
                this.assignments.splice(i, 1);
                return this.assignments.length;
            }
        }
        return -1;
    }
}


// Token
class Token extends Object {
    // Attributes
    private user: ObjectId;

    // Constructor
    constructor(id: ObjectId, user: ObjectId) {
        super(id);
        this.user = user;
    }
    
    // Validate token
    validate(user: ObjectId) {return this.user == user}
}
