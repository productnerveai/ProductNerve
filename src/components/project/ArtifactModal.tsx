import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ArtifactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artifact: {
    title: string;
    type: string;
    status: string;
    content?: any;
    created_at?: string;
  } | null;
}

function renderContent(content: any): string {
  if (!content) return "No content available.";
  if (typeof content === "string") return content;
  try {
    return JSON.stringify(content, null, 2);
  } catch {
    return String(content);
  }
}

export default function ArtifactModal({ open, onOpenChange, artifact }: ArtifactModalProps) {
  if (!artifact) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{artifact.title}</DialogTitle>
            <Badge variant="outline" className="text-xs">{artifact.type}</Badge>
            <Badge variant="outline" className="text-xs">{artifact.status}</Badge>
          </div>
          {artifact.created_at && (
            <p className="text-xs text-muted-foreground">
              Created {new Date(artifact.created_at).toLocaleDateString()}
            </p>
          )}
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <pre className="text-sm whitespace-pre-wrap break-words p-4 bg-muted/30 rounded-lg">
            {renderContent(artifact.content)}
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
