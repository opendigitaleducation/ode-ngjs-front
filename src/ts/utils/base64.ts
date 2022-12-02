export abstract class Base64
{
    public static encode(str: string): string
    {
        return btoa(str);
    }

    public static decode(str: string): string
    {
        return atob(str);
    }
}
