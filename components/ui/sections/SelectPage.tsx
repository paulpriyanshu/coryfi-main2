import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllBusinessPage } from "@/app/api/business/business";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react"; // Import loader icon

export function SelectDemo({ businessId }: { businessId: string }) {
  const [pages, setPages] = React.useState<{ pageId: string; name: string }[]>([]);
  const [loading, setLoading] = React.useState(true); // Added loading state
  const router = useRouter();

  React.useEffect(() => {
    const getPages = async () => {
      if (!businessId) return;
      setLoading(true); // Set loading to true before fetching
      try {
        const data = await getAllBusinessPage(businessId);
        console.log("data of pages", data);
        if (data?.pageData?.length > 0) {
          setPages(data.pageData);
        }
      } catch (error) {
        console.error("Error fetching business pages:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    getPages();
  }, [businessId]);

  const handlePageSelect = (pageId: string) => {
    router.replace(`/dashboard/${businessId}/${pageId}`);
  };

  return (
    <Select onValueChange={handlePageSelect} disabled={loading}>
      <SelectTrigger className="w-[180px]">
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          <SelectValue placeholder={pages.length > 0 ? "Select a Page" : "No Pages Available"} />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {pages.map((page) => (
            <SelectItem key={page.pageId} value={page.pageId}>
              {page.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}