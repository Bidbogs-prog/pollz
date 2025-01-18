import "@/app/globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const {
  //   data: { session },
  // } = await supabase.auth.getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SidebarProvider>
          <AppSidebar />
          <main>
            <SidebarTrigger />
            {children}
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
