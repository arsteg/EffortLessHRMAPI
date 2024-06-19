class connectedUser {
    static userList = [];
  
    constructor() {}
  
    static getUserList() {      
      return this.userList;
    }  
    static addUser(connectedUser) {      
      const added = this.userList.find((currentUser) => currentUser.id == user.id);
      if (added) {
        return;
      }
      this.userList.push(user);
    }
  
    static removeUser(id) {      
      if (this.userList) {
        this.userList = this.userList.filter((user) => user.id != id);
      }
    }
  }  
  module.exports = { connectedUser };
  