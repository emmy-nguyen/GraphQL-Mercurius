"use strict";

import { randomUUID } from "crypto";

export const schema = `
  type Post {
    id: ID!
    title: String!
    content: String!
    tag: Tag!
  }

  input PostCreate {
    title: String!
    content: String!
    tagId: ID!
  }

  input PostUpdate {
    title: String!
    content: String!
  }

  type Tag {
    id: ID!
    name: String!
  }

  type Query {
    getPosts: [Post!]!
    getPost(id: ID!): Post
    getTags: [Tag!]!
    getPostsByTag(tagId: ID!): [Post!]!
  }

  type Mutation {
    createPost(newPost: PostCreate!): Post!
    deletePost(id: ID!): Post!
    updatePost(id: ID!, updatedPost: PostUpdate!): Post!
    createTag(name: String!): Tag!
  }
`;

export const resolvers = {
  Query: {
    getPosts: (_parent, args, { app }) => {
      return app.db.posts;
    },
    getPost: (_parent, args, { app }) => {
      const { id } = args;
      return app.db.posts.find((post) => post.id === id);
    },
    getTags: (_parent, args, { app }) => {
      return app.db.tags;
    },
    getPostsByTag: (_parent, args, { app }) => {
      const  { tagId } = args;
      if(!tagId) {
        throw new Error(`${tagId} is not found`)
      }
      return app.db.posts.filter(post => post.tag.id === tagId);
    }
  },
  Mutation: {
    createPost: (_parent, { newPost }, { app }) => {
      const { title, content, tagId } = newPost;
      const tag = app.db.tags.find((tag) => tag.id === tagId);
      if(!tag) {
        throw new Error ("Tag not found")
      }
      const post = {
        id: randomUUID(),
        title,
        content,
        tag,
      };
      app.db.posts.push(post);
      return post;
    },

    updatePost: (_parent, { id, updatedPost }, { app }) => {
      const postIndex = app.db.posts.findIndex((post) => post.id === id);

      if(postIndex > -1) {
        const post = app.db.posts[postIndex];
        post.title = updatedPost.title;
        post.content = updatedPost.content
        
        return app.db.posts[postIndex];
      }
      throw new Error (`Cannot find the post with ${id}`)
      
    },
    deletePost: (_parent, args, { app }) => {
      const { id } = args;
      const postIndex = app.db.posts.findIndex((post) => post.id === id);
      if(postIndex > -1) {
        return app.db.posts.splice(postIndex, 1);
      }
      throw new Error("Post not found")
    },

    createTag: (_parent, { name }, { app }) => {
      
      const tag =  {
        id: randomUUID(),
        name,
      };
  
      app.db.tags.push(tag);
      return tag;
    }
  },
}

export const loaders = {};
