namespace VoteApi.Models
{
    public class Message
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public int Votes { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
