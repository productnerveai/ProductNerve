import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  // const { data: post, isLoading } = useQuery({
  //   queryKey: ["blog-post", slug],
  //   queryFn: async () => {
  //     const { data } = await supabase
  //       .from("blog_posts")
  //       .select("*")
  //       .eq("slug", slug)
  //       .eq("is_published", true)
  //       .single();
  //     return data;
  //   },
  // });

  // if (isLoading) {
  //   return (
  //     <div className="flex justify-center py-32">
  //       <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
  //     </div>
  //   );
  // }

  // if (!post) {
  //   return (
  //     <div className="py-32 text-center">
  //       <h1 className="text-2xl font-bold mb-4">Post not found</h1>
  //       <Link to="/blog" className="text-accent hover:underline">← Back to Blog</Link>
  //     </div>
  //   );
  // }

  return (
    <div>
      {/* {post.cover_image_url && (
        <div className="w-full h-64 md:h-80 bg-muted overflow-hidden">
          <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )} */}

      <article className="py-16 bg-background">
        <div className="container max-w-3xl">
          <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Blog
          </Link>

          {/* <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1> */}

          <div className="flex items-center gap-3 mb-8">
            {/* {post.published_at && (
              <span className="text-sm text-muted-foreground">
                {new Date(post.published_at).toLocaleDateString()}
              </span>
            )}
            {post.tags?.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>

          <div className="prose prose-sm max-w-none text-foreground">
            {post.content.split("\n").map((p, i) => (
              <p key={i} className="mb-4 text-muted-foreground leading-relaxed">{p}</p>
            ))} */}
          </div>
        </div>
      </article>
    </div>
  );
}
