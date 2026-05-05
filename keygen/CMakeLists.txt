cmake_minimum_required(VERSION 3.10)
project(ZaStampuKeyGen CXX)
set(CMAKE_CXX_STANDARD 17)
add_executable(keygen keygen.cpp)
# No external dependencies needed - SHA256 implemented inline
# Windows: set_target_properties(keygen PROPERTIES WIN32_EXECUTABLE FALSE)
