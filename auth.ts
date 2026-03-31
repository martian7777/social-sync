import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"

import Google from "next-auth/providers/google"
import Nodemailer from "next-auth/providers/nodemailer"
import Twitter from "next-auth/providers/twitter"
import Facebook from "next-auth/providers/facebook"
import Instagram from "next-auth/providers/instagram"
import TikTok from "next-auth/providers/tiktok"
import Reddit from "next-auth/providers/reddit"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google,
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    Twitter({
      // We want write access for posting tweets
      authorization: {
        url: "https://twitter.com/i/oauth2/authorize",
        params: { scope: "tweet.read tweet.write users.read offline.access" },
      },
    }),
    Facebook({
      authorization: {
        params: { scope: "email public_profile pages_manage_posts pages_read_engagement" },
      },
    }),
    Instagram({
      authorization: {
        params: { scope: "instagram_basic instagram_content_publish pages_read_engagement pages_show_list" },
      },
    }),
    TikTok({
      authorization: {
        params: { scope: "user.info.basic video.upload" },
      },
    }),
    Reddit({
      authorization: {
        params: { scope: "identity read submit", duration: "permanent" },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    }
  },
  pages: {
    signIn: "/",
  }
})
