from getpass import getpass

from core.security import hash_password


password = getpass("Enter password: ")

hashed_password = hash_password(password)

print("\nPassword hash:")
print(hashed_password)