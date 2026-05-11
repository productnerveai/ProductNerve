import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2, FileText, Newspaper, Upload, X, Image } from "lucide-react";
import AdminApiService from "@/services/adminApi";

function ImageUpload({ value, onChange }: { value: string | null; onChange: (url: string | null) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Invalid file type. Use JPG, PNG or WebP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Max 5MB");
      return;
    }
    setUploading(true);
    try {
      // Simulate upload
      const url = `https://picsum.photos/seed/${Date.now()}/800/400.jpg`;
      setTimeout(() => {
        onChange(url);
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }, 1500);
    } catch (err: any) {
      toast.error("Upload failed");
      setUploading(false);
    }
  };

  return (
    <div>
      <Label>Cover Image</Label>
      {value ? (
        <div className="relative mt-1 rounded-lg overflow-hidden border" style={{ maxHeight: 200 }}>
          <img src={value} alt="Cover" className="w-full h-40 object-cover" />
          <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => onChange(null)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div
          className="mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Click to upload cover image"}</p>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP — max 5MB</p>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
    </div>
  );
}

// Generate dummy content data
const generateDummyPages = () => [
  {
    id: "page1",
    title: "About Us",
    slug: "about",
    content: "We are a company dedicated to providing innovative solutions for product development.",
    meta_title: "About Us - Our Company",
    meta_description: "Learn about our mission and values.",
    is_published: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "page2",
    title: "Contact",
    slug: "contact",
    content: "Get in touch with us through our contact form.",
    meta_title: "Contact Us",
    meta_description: "Reach out to our team.",
    is_published: true,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "page3",
    title: "Privacy Policy",
    slug: "privacy",
    content: "Our privacy policy explains how we handle your data.",
    meta_title: "Privacy Policy",
    meta_description: "Read our privacy policy.",
    is_published: false,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const generateDummyPosts = () => [
  {
    id: "post1",
    title: "Getting Started with Product Development",
    slug: "getting-started",
    excerpt: "Learn the basics of product development with our comprehensive guide.",
    content: "Product development is a complex process that requires careful planning and execution...",
    meta_title: "Getting Started with Product Development",
    meta_description: "A comprehensive guide to product development for beginners.",
    tags: "product,development,guides",
    cover_image_url: "https://picsum.photos/seed/post1/800/400.jpg",
    is_published: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post2",
    title: "Top 10 Product Management Tools",
    slug: "product-management-tools",
    excerpt: "Discover the best tools to streamline your product management workflow.",
    content: "Effective product management requires the right tools...",
    meta_title: "Top 10 Product Management Tools",
    meta_description: "Essential tools for modern product managers.",
    tags: "product,tools,management",
    cover_image_url: "https://picsum.photos/seed/post2/800/400.jpg",
    is_published: true,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post3",
    title: "User Research Best Practices",
    slug: "user-research-best-practices",
    excerpt: "Learn how to conduct effective user research for your products.",
    content: "User research is fundamental to creating successful products...",
    meta_title: "User Research Best Practices",
    meta_description: "Best practices for conducting user research.",
    tags: "research,ux,user-experience",
    cover_image_url: "https://picsum.photos/seed/post3/800/400.jpg",
    is_published: false,
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function ContentManagementPage() {
  const [editPage, setEditPage] = useState<any>(null);
  const [editPost, setEditPost] = useState<any>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [postForm, setPostForm] = useState({ title: "", slug: "", excerpt: "", content: "", meta_title: "", meta_description: "", tags: "", cover_image_url: null as string | null });
  const [pages, setPages] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const [pagesResponse, postsResponse] = await Promise.all([
        AdminApiService.getAllPages(),
        AdminApiService.getAllBlogPosts()
      ]);

      if (pagesResponse.success) {
        setPages(pagesResponse.data.pages);
      }

      if (postsResponse.success) {
        setPosts(postsResponse.data.blog_posts);
      }

      if (!pagesResponse.success || !postsResponse.success) {
        toast.error("Failed to load content");
      }
    } catch (error) {
      toast.error("Error loading content");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePage = async ({ id, updates }: { id: string; updates: any }) => {
    setIsLoading(true);
    setTimeout(() => {
      setPages(prev => prev.map(page => page.id === id ? { ...page, ...updates } : page));
      toast.success("Page updated");
      setEditPage(null);
      setIsLoading(false);
    }, 1000);
  };

  const createPost = async () => {
    setIsLoading(true);
    try {
      const response = await AdminApiService.createBlogPost({
        title: postForm.title,
        slug: postForm.slug || undefined,
        excerpt: postForm.excerpt,
        content: postForm.content,
        meta_title: postForm.meta_title,
        meta_description: postForm.meta_description,
        tags: postForm.tags ? postForm.tags.split(',').map(tag => tag.trim()) : [],
        cover_image_url: postForm.cover_image_url,
        is_published: false
      });

      if (response.success) {
        setPosts(prev => [response.data, ...prev]);
        toast.success("Post created");
        setShowNewPost(false);
        setPostForm({ title: "", slug: "", excerpt: "", content: "", meta_title: "", meta_description: "", tags: "", cover_image_url: null });
      } else {
        toast.error(response.error || "Failed to create post");
      }
    } catch (error) {
      toast.error("Error creating post");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePost = async ({ id, updates }: { id: string; updates: any }) => {
    setIsLoading(true);
    try {
      const response = await AdminApiService.updateBlogPost(id, updates);
      if (response.success) {
        setPosts(prev => prev.map(post => post.id === id ? { ...post, ...response.data } : post));
        toast.success("Post updated");
        setEditPost(null);
      } else {
        toast.error(response.error || "Failed to update post");
      }
    } catch (error) {
      toast.error("Error updating post");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await AdminApiService.deleteBlogPost(id);
      if (response.success) {
        setPosts(prev => prev.filter(post => post.id !== id));
        toast.success("Post deleted");
      } else {
        toast.error(response.error || "Failed to delete post");
      }
    } catch (error) {
      toast.error("Error deleting post");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublish = async ({ id, is_published }: { id: string; is_published: boolean }) => {
    setIsLoading(true);
    try {
      const response = await AdminApiService.publishBlogPost(id);
      if (response.success) {
        setPosts(prev => prev.map(post => post.id === id ? { ...response.data } : post));
        toast.success("Post published");
      } else {
        toast.error(response.error || "Failed to publish post");
      }
    } catch (error) {
      toast.error("Error publishing post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Content Management</h1>
        <p className="text-muted-foreground text-sm">Manage pages and blog posts</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="pt-4 text-center"><FileText className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{pages?.length ?? 0}</p><p className="text-xs text-muted-foreground">Pages</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Newspaper className="h-5 w-5 mx-auto text-accent mb-1" /><p className="text-2xl font-bold">{posts?.length ?? 0}</p><p className="text-xs text-muted-foreground">Blog Posts</p></CardContent></Card>
      </div>

      <Tabs defaultValue="pages">
        <TabsList>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="mt-4">
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Title</TableHead><TableHead>Slug</TableHead><TableHead>Published</TableHead><TableHead>Updated</TableHead><TableHead>Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {pages?.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell className="text-sm font-mono">{p.slug}</TableCell>
                    <TableCell><Badge variant={p.is_published ? "default" : "outline"}>{p.is_published ? "Published" : "Draft"}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setEditPage(p)}><Edit className="h-3.5 w-3.5 mr-1" /> Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!pages || pages.length === 0) && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No pages</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="blog" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setShowNewPost(true)}><Plus className="h-4 w-4 mr-1" /> New Post</Button>
          </div>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Title</TableHead><TableHead>Image</TableHead><TableHead>Published</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {posts?.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>
                      {p.cover_image_url ? (
                        <img src={p.cover_image_url} alt="" className="h-8 w-12 object-cover rounded" />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch checked={p.is_published} onCheckedChange={() => togglePublish(p)} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditPost(p)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deletePost(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!posts || posts.length === 0) && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No blog posts</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Page Dialog */}
      <Dialog open={!!editPage} onOpenChange={() => setEditPage(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader><DialogTitle>Edit Page: {editPage?.title}</DialogTitle></DialogHeader>
          {editPage && (
            <EditPageForm page={editPage} onSave={(updates) => updatePage({ id: editPage.id, updates })} saving={isLoading} />
          )}
        </DialogContent>
      </Dialog>

      {/* New Post Dialog */}
      <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader><DialogTitle>New Blog Post</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <ImageUpload value={postForm.cover_image_url} onChange={url => setPostForm(f => ({ ...f, cover_image_url: url }))} />
            <div><Label>Title *</Label><Input value={postForm.title} onChange={e => setPostForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Slug</Label><Input value={postForm.slug} onChange={e => setPostForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated if empty" /></div>
            <div><Label>Excerpt</Label><Textarea value={postForm.excerpt} onChange={e => setPostForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} /></div>
            <div><Label>Content *</Label><Textarea value={postForm.content} onChange={e => setPostForm(f => ({ ...f, content: e.target.value }))} rows={8} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Meta Title</Label><Input value={postForm.meta_title} onChange={e => setPostForm(f => ({ ...f, meta_title: e.target.value }))} /></div>
              <div><Label>Tags (comma separated)</Label><Input value={postForm.tags} onChange={e => setPostForm(f => ({ ...f, tags: e.target.value }))} /></div>
            </div>
            <div><Label>Meta Description</Label><Textarea value={postForm.meta_description} onChange={e => setPostForm(f => ({ ...f, meta_description: e.target.value }))} rows={2} /></div>
            <Button onClick={() => createPost()} disabled={isLoading || !postForm.title || !postForm.content} className="w-full">Create Post</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={!!editPost} onOpenChange={() => setEditPost(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader><DialogTitle>Edit Post: {editPost?.title}</DialogTitle></DialogHeader>
          {editPost && (
            <EditPostForm post={editPost} onSave={(updates) => updatePost({ id: editPost.id, updates })} saving={isLoading} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditPageForm({ page, onSave, saving }: { page: any; onSave: (u: any) => void; saving: boolean }) {
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [metaTitle, setMetaTitle] = useState(page.meta_title || "");
  const [metaDesc, setMetaDesc] = useState(page.meta_description || "");
  const [published, setPublished] = useState(page.is_published);

  return (
    <div className="space-y-3">
      <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
      <div><Label>Content</Label><Textarea value={content} onChange={e => setContent(e.target.value)} rows={10} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Meta Title</Label><Input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} /></div>
        <div><Label>Meta Description</Label><Input value={metaDesc} onChange={e => setMetaDesc(e.target.value)} /></div>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={published} onCheckedChange={setPublished} />
        <Label>Published</Label>
      </div>
      <Button onClick={() => onSave({ title, content, meta_title: metaTitle || null, meta_description: metaDesc || null, is_published: published })} disabled={saving} className="w-full">
        Save Changes
      </Button>
    </div>
  );
}

function EditPostForm({ post, onSave, saving }: { post: any; onSave: (u: any) => void; saving: boolean }) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [excerpt, setExcerpt] = useState(post.excerpt || "");
  const [metaTitle, setMetaTitle] = useState(post.meta_title || "");
  const [metaDesc, setMetaDesc] = useState(post.meta_description || "");
  const [tags, setTags] = useState((post.tags || []).join(", "));
  const [coverImage, setCoverImage] = useState<string | null>(post.cover_image_url || null);

  return (
    <div className="space-y-3">
      <ImageUpload value={coverImage} onChange={setCoverImage} />
      <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
      <div><Label>Excerpt</Label><Textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} /></div>
      <div><Label>Content</Label><Textarea value={content} onChange={e => setContent(e.target.value)} rows={8} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Meta Title</Label><Input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} /></div>
        <div><Label>Tags (comma separated)</Label><Input value={tags} onChange={e => setTags(e.target.value)} /></div>
      </div>
      <div><Label>Meta Description</Label><Textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} rows={2} /></div>
      <Button onClick={() => onSave({
        title, content, excerpt: excerpt || null,
        meta_title: metaTitle || null, meta_description: metaDesc || null,
        tags: tags ? tags.split(",").map(t => t.trim()) : [],
        cover_image_url: coverImage,
      })} disabled={saving} className="w-full">Save Changes</Button>
    </div>
  );
}
