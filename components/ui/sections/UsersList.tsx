// app/components/UsersList/UsersContainer.tsx
import UsersList from "./UserListClient";


interface User {
  id: string;
  name: string;
  email: string;
  userdp: string;
}

interface UsersContainerProps {
  users: User[];
}

export default function UsersContainer({ users }) {
    // console.log("users",users)
  return <UsersList users={users}  />;
}