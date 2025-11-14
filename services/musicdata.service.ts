class MusicDataService {
  // Dữ liệu mẫu V-Pop
  private vpopData = [
    {
      title: "Hãy Trao Cho Anh",
      artists: ["Sơn Tùng M-TP"],
      album: "Single",
      coverImage:
        "https://i.scdn.co/image/ab67616d0000b2738c5f987daf7bd4be3d24a87f",
      fileUrl: "https://www.youtube.com/watch?v=knW7-x7Y7RE",
      lyrics: "",
      description: "Bài hát nổi tiếng của Sơn Tùng M-TP",
      topic: "V-Pop",
    },
    {
      title: "Lạc Trôi",
      artists: ["Sơn Tùng M-TP"],
      album: "Single",
      coverImage:
        "https://i.scdn.co/image/ab67616d0000b273fd6827d03e122a2207f8c44b",
      fileUrl: "https://www.youtube.com/watch?v=DrY_K0mT-As",
      lyrics: "",
      description: "MV đạt 100 triệu views",
      topic: "V-Pop",
    },
    {
      title: "Em Của Ngày Hôm Qua",
      artists: ["Sơn Tùng M-TP"],
      album: "Single",
      coverImage:
        "https://i.scdn.co/image/ab67616d0000b273e20b0fc8a4e29e620cf4df0a",
      fileUrl: "https://www.youtube.com/watch?v=pT8488PCc_0",
      lyrics: "",
      description: "Ballad nổi tiếng",
      topic: "V-Pop",
    },
    {
      title: "Anh Ơi Ở Lại",
      artists: ["Chi Pu"],
      album: "Single",
      coverImage:
        "https://i.scdn.co/image/ab67616d0000b2739a06b3e1e2c91b0f71e48e28",
      fileUrl: "https://www.youtube.com/watch?v=FN7ALfpGxiI",
      lyrics: "",
      description: "Chi Pu comeback",
      topic: "V-Pop",
    },
    {
      title: "Người Lạ Ơi",
      artists: ["Karik", "Orange", "Superbrothers"],
      album: "Rap Việt",
      coverImage:
        "https://i.scdn.co/image/ab67616d0000b273e5e4c8e0a1f5e4f7b3f8f0e8",
      fileUrl: "https://www.youtube.com/watch?v=YzEKqvTKQBE",
      lyrics: "",
      description: "Hit từ Rap Việt",
      topic: "Rap Việt",
    },
    {
      title: "Chúng Ta Của Hiện Tại",
      artists: ["Sơn Tùng M-TP"],
      album: "Single",
      coverImage:
        "https://i.scdn.co/image/ab67616d0000b273a1e5e4f7b3f8f0e8d0e0e0e0",
      fileUrl: "https://www.youtube.com/watch?v=psZ1g9fMfeo",
      lyrics: "",
      description: "Ballad nhẹ nhàng",
      topic: "V-Pop",
    },
    {
      title: "Hồng Nhan",
      artists: ["Jack", "K-ICM"],
      album: "Single",
      coverImage:
        "https://i.scdn.co/image/ab67616d0000b273b0f8f0e8d0e0e0e0e0e0e0e0",
      fileUrl: "https://www.youtube.com/watch?v=BNQQaB2xFSw",
      lyrics: "",
      description: "Nhạc trẻ hot nhất",
      topic: "V-Pop",
    },
    {
      title: "Sóng Gió",
      artists: ["Jack", "K-ICM"],
      album: "Single",
      coverImage:
        "https://i.scdn.co/image/ab67616d0000b273c0e0e0e0e0e0e0e0e0e0e0e0",
      fileUrl: "https://www.youtube.com/watch?v=VnI3v11KxhE",
      lyrics: "",
      description: "Triệu view trên YouTube",
      topic: "V-Pop",
    },
    {
      title: "Bạc Phận",
      artists: ["Jack", "K-ICM"],
      album: "Single",
      coverImage:
        "https://i.scdn.co/image/ab67616d0000b273d0e0e0e0e0e0e0e0e0e0e0e0",
      fileUrl: "https://www.youtube.com/watch?v=W04NbT-kwys",
      lyrics: "",
      description: "Nhạc buồn",
      topic: "V-Pop",
    },
    {
      title: "Nơi Này Có Anh",
      artists: ["Sơn Tùng M-TP"],
      album: "Single",
      coverImage:
        "https://i.scdn.co/image/ab67616d0000b273e0e0e0e0e0e0e0e0e0e0e0e0",
      fileUrl: "https://www.youtube.com/watch?v=FN7ALfpGxiI",
      lyrics: "",
      description: "Debut hit",
      topic: "V-Pop",
    },
  ];

  async getMockData(limit: number = 20) {
    return this.vpopData.slice(0, limit);
  }

  async searchByTopic(topic: string) {
    return this.vpopData.filter((song) =>
      song.topic.toLowerCase().includes(topic.toLowerCase())
    );
  }
}

export default new MusicDataService();
