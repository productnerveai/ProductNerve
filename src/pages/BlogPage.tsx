import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function BlogPage() {
  // const { data: posts, isLoading } = useQuery({
  //   queryKey: ["blog-posts"],
  //   queryFn: async () => {
  //     const { data } = await supabase
  //       .from("blog_posts")
  //       .select("id, title, slug, excerpt, cover_image_url, published_at, tags")
  //       .eq("is_published", true)
  //       .order("published_at", { ascending: false });
  //     return data || [];
  //   },
  // });

  return (
    <div>
      <section className="hero-gradient text-primary-foreground py-20">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-up">Blog</h1>
          <p className="text-primary-foreground/70 max-w-xl mx-auto">
            Insights on venture building, structured validation, and startup intelligence.
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container max-w-4xl">
          {/* {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-8">
              {posts.map(post => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="block glass-card rounded-xl p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex gap-6">
                    {post.cover_image_url && (
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-40 h-28 object-cover rounded-lg shrink-0 hidden sm:block"
                        loading="lazy"
                      />
                    )}
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-2 text-foreground">{post.title}</h2>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="flex items-center gap-3">
                        {post.published_at && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.published_at).toLocaleDateString()}
                          </span>
                        )}
                        {post.tags?.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No blog posts yet. Check back soon!</p>
            </div>
          )} */}
        </div>
      </section>
    </div>
  );
}
