// app/components/UsersList/UsersContainer.tsx
import UsersList from "./UserListCLient"
import { findPath } from "@/app/api/actions/pathActions";

interface User {
  id: string;
  name: string;
  email: string;
  userdp: string;
}

interface UsersContainerProps {
  users: User[];
}

export default function UsersContainer({ users }: UsersContainerProps) {
    // console.log("users",users)
  return <UsersList users={users} findPath={findPath} />;
}