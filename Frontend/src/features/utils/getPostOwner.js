export function getPostOwner(post) {
    const owner = post?.postBy;
    const isNgo = post?.postByModel === "Ngo";
    return {
      id: owner?._id,
      name: isNgo ? owner?.name : owner?.username,
      image: owner?.image,
      isNgo,
    };
  }