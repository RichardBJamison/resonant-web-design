export default {
  async fetch(request) {
    const target = new URL(request.url);
    target.hostname = "resonantwebdesign.com";
    target.protocol = "https:";
    return Response.redirect(target.toString(), 301);
  },
};
