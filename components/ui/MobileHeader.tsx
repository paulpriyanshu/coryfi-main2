'use client'

import * as React from 'react'
import { Bell, Menu, Search, Plus, MessageSquare, User, ChevronDown, Mail, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'

export default function MobileHeader() {
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const SidebarContent = () => (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <Tabs defaultValue="dms" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="dms">DMs</TabsTrigger>
            <TabsTrigger value="mails">Mails</TabsTrigger>
            <TabsTrigger value="reaches">Reaches</TabsTrigger>
          </TabsList>
          <TabsContent value="dms">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Williams'].map(name => (
                <div key={name} className="flex items-center space-x-2 mb-4 p-2 hover:bg-slate-500 rounded-lg transition-colors cursor-pointer">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt={name} />
                    <AvatarFallback>{name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-black">{name}</p>
                    <p className="text-sm text-black">Hey, how are you?</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="mails">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {['New project proposal', 'Meeting minutes', 'Weekly report', 'Client feedback'].map(title => (
                <div key={title} className="flex items-center space-x-2 mb-4 p-2 hover:bg-slate-500 rounded-lg transition-colors cursor-pointer">
                  <Mail className="w-5 h-5 text-black" />
                  <div>
                    <p className="font-medium text-black">{title}</p>
                    <p className="text-sm text-black">From: Alice Johnson</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="reaches">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {['Emma Thompson', 'Michael Brown', 'Garvit Singh', 'Sophia Lee'].map(name => (
                <div key={name} className="flex items-center justify-between mb-4 p-2 hover:bg-slate-500 rounded-lg transition-colors">
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt={name} />
                      <AvatarFallback>{name[0]}</AvatarFallback>
                    </Avatar>
                    <p className="font-medium text-black">{name}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-black border-black hover:bg-slate-500">Connect</Button>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-200 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-md' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="py-4">
                  <SidebarContent />
                </div>
              </SheetContent>
            </Sheet>
            <a href="#" className="text-2xl font-bold text-black">
              CoryFi
            </a>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <form className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 w-[300px] bg-muted focus-visible:ring-black"
              />
            </form>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden md:inline-flex text-black hover:text-black hover:bg-slate-500">
              <Plus className="h-5 w-5" />
              <span className="sr-only">Create post</span>
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:inline-flex text-black hover:text-black hover:bg-slate-500">
              <MessageSquare className="h-5 w-5" />
              <span className="sr-only">Messages</span>
            </Button>
            <Button variant="ghost" size="icon" className="text-black hover:text-black hover:bg-slate-500">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-px rounded-full h-8 w-8">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">john@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Messages</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}