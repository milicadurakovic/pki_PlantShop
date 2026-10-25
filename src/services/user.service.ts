import type { User } from '../models/user.model';

const USER_STORAGE_KEY = 'plant_shop_current_user';

export class UserService {
  
  static getCurrentUser(): User | null {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  
  static saveCurrentUser(user: User): void {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

 
  static login(email: string): User {
    const currentUser = this.getCurrentUser();
    
    const isMilica = email.toLowerCase().includes('milica');
    const nameFromEmail = email.split('@')[0];
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

    const user: User = {
      id: currentUser && currentUser.email === email ? currentUser.id : Date.now(),
      firstName: isMilica ? 'Milica' : (currentUser?.firstName || formattedName),
      lastName: currentUser?.lastName || 'Korisnik',
      email: email,
      address: currentUser?.address || 'Beograd, Srbija',
      phone: '',
      favoritePlantTypes: [],
      username: ''
    };

    this.saveCurrentUser(user);
    return user;
  }

  
  static logout(): void {
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  
  static updateUserProfile(updatedData: Partial<User>): User | null {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    const newUserData = { ...currentUser, ...updatedData };
    this.saveCurrentUser(newUserData);
    return newUserData;
  }
}